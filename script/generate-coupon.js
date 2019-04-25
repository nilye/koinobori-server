const c = [
	'p2a2S_',
	'N5DbRF',
	'1noLEi',
]
const n = ['测试0','测试1','测试2']

const initDb = require('../db').initDb

let Coupon
initDb.then((db)=>{
	Coupon = db.collection('coupon')
	let data = []
	for (let i in c){
		data.push({
			code: c[i],
			name: n[i],
			usedCount: 0,
			passCode:'testCoupon'+i,
			discount: 10
		})
	}
	console.log(data)

	Coupon.insertMany(data).then()


}).catch(err=>{
	console.log(err)
})
