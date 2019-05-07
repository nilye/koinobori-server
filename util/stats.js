const pipelines = require('./pipelines')
const db = require('../db').db()
const Order = db.collection('order')
const Coupon = db.collection('coupon')
const Ticket = db.collection('ticket')
const stats = {}

const price = [0,68,98,138],
	sum = (a,b) => a + b

stats.distributor = {
	getOne: async function(code){
		try {
			let result = await Order.aggregate(pipelines.couponStats(code)).toArray();
			result = result[0]
			let	usedItems = result['usedItems'],
				usedCount = result['usedCount'],
				{profitReturn, revenue} = this.calculateReturn(result['couponInfo']['settlement'], usedItems, result['orderCount']),
				updateInfo = await Coupon.findOneAndUpdate({ code }, {
					$set: { usedCount, profitReturn, revenue }
				},{
					returnOriginal: false
				});
			return Object.assign(updateInfo.value, {usedItems})
		} catch (err){
			console.log(err)
		}
	},

	getAll: async function(){
		try {
			let allCoupons = await Order.aggregate(pipelines.couponStats()).toArray()
			return allCoupons.map(i=>{
				return {
					code: i._id,
					name: i['couponInfo'].name,
					profitReturn: i['couponInfo'].profitReturn,
					revenue: i['couponInfo'].revenue,
					usedCount: i.usedCount,
					orderCount: i.orderCount
				}
			})
		} catch (err){
			console.log(err)
		}
	},

	updateAll: async function(){
		try {
			let allCoupons  = await Order.aggregate(pipelines.couponStats()).toArray(),
				bulk = []
			for (let i of allCoupons){
				let usedCount = i['usedCount'],
					{profitReturn, revenue }= this.calculateReturn(i['couponInfo']['settlement'], i['usedItems'], i['orderCount'])
				bulk.push({
					updateOne:{
						filter: {code: i._id},
						update: { $set:{usedCount, profitReturn, revenue}}
					}
				})
			}
			return await Coupon.bulkWrite(bulk)
		} catch (err){
			console.log(err)
		}
	},

	calculateReturn: function (way, rawItems, orderCount) {
		// map and flat items, in case the items.qty > 1
		let items = [];
		for (let i in rawItems){
			let v = rawItems[i]
			if (v.items.qty > 1){
				let subArray = []
				for (let j=0; j<v.items.qty; j++){
					subArray.push(price[v.items.type])
				}
				items.splice(i, 1, ...subArray)
			} else {
				items.push(price[v.items.type])
			}
		}
		//calculate
		let p = 0, r = 0, l = items.length;
		if (way === 'step-wise'){
			if (l > 0){
				let t = items.slice(0, 3000).reduce(sum)
				r += t
				p += t * (1-0.78)
			} else if (l > 3000){
				let t = items.slice(3000, 5000).reduce(sum)
				r += t
				p += t * (1-0.75)
			} else if (l > 5000) {
				let t = items.slice(5000).reduce(sum)
				r += t
				p += t * (1-0.7)
			}
		} else if (way === 'flat-ratio'){
			if (l > 0){
				r += items.reduce(sum)
				p += r * (1 - 0.8) - (orderCount*10)
			}
		}
		return {
			revenue: r ,
			profitReturn: Math.round(p*100)/100
		}
	}
}

stats.checkin = {
	byDay: async function(start, end){
		try {
			let data = await Ticket.aggregate(pipelines.checkinByDay(start, end)).toArray()
			return data.map(d=>{
				let items = d.items.map(i=>{
					if (i.source !== 'giveaway'){
						return price[i.type]
					} else {
						return 0
					}
				})
				let checkedRevenue = items.reduce(sum)
				return {
					date: d._id,
					count: d.count,
					checkedRevenue
				}
			})
		} catch (err){
			console.log(err)
		}
	},
	total: async function(){
		try {
			let total = await Ticket.aggregate(pipelines.checkinTotal()).toArray()
			return total[0]['total']
		} catch (err){}
	}
}

stats.sale = {
	total: async function () {
		try {
			let types = await Order.aggregate(pipelines.salesTotal()).toArray(),
				ppl = types.map(i=>i['ppl']).reduce(sum),
				count = types.map(i=>i['count']).reduce(sum)
			return {types, sum:{count, ppl}}
		} catch (err){}
	}
}


module.exports = stats