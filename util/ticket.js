const nanoid = require('nanoid')
const db = require('../db').db()
const Order = db.collection('order')
const Ticket = db.collection('ticket')
const User = db.collection('user')

module.exports = exports = {}

function createTicket(order, source) {
	return new Promise((resolve, reject) => {
		let data = []
		for (let item of order.items){
			for (let i = 0; i < item.qty; i++){
				data.push({
					code: nanoid(11),
					createdTime: new Date(),
					checked: false,
					checkedTime: null,
					items: {
						type:item.type,
						qty:1
					},
					orderNo: order.orderNo,
					openid: order.openid,
					phone: order.phone,
					source: source
				})
			}
		}
		Ticket.insertMany(data).then(newTicket => {
			resolve(newTicket.ops)
		}).catch(err=>{
			console.log(err)
		})
	})
}

exports.signin = function({openid, phone, userInfo}){
	return new Promise((resolve, reject)=>{
		User.findOne({openid}).then(exist=>{
			if (!exist){
				User.insertOne({openid, phone, profile: userInfo })
					.then(newUser=> resolve(newUser.ops[0]))
					.catch(err=> reject(err))
			} else {
				resolve(exist)
			}
		})
	})
}

exports.createTicketFromGiveaway = function(req){
	return new Promise((resolve, reject) =>{
		createTicket(req, 'giveaway').then(newTicket => {
			resolve(newTicket)
		}).catch(err=>{
			console.log(err)
			reject(err)
		})
	})
}

exports.createTicketFromOrder = function(req){
	return new Promise((resolve, reject) => {
		Ticket.find({orderNo: req.orderNo }).toArray().then(ticket => {
			if (ticket.length > 0) {
				resolve(ticket)
			} else {
				createTicket(req, 'wxpay').then(newTicket => {
					resolve(newTicket)
				}).catch(err=>{
					console.log(err)
					reject(err)
				})
			}
		}).catch(err=>{
			console.log(err)
		})
	})
}