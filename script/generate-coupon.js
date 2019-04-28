const c = {
	"OmR7oK": "凤凰书城",
	"6Ra5i5": "南京招生考试",
	"039Vtb": "唯然",
	"23Ejme": "市妇女儿童活动中心"
}

const initDb = require('../db').initDb

let Coupon
initDb.then((db)=>{
	Coupon = db.collection('coupon')
	let data = []
	for (let i in c){
		data.push({
			code: i,
			name: c[i],
			usedCount: 0,
			discount: 0
		})
	}
	console.log(data)

	Coupon.insertMany(data).then()


}).catch(err=>{
	console.log(err)
})
