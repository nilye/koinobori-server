const c = {
	"OmR7oK": "凤凰书城",
	"6Ra5i5": "南京招生考试",
	"039Vtb": "唯然",
	"23Ejme": "市妇女儿童活动中心"
}

const initDb = require('../db').initDb

var json = require('./giveaways/5-1.json')

let Giveaway
initDb.then((db)=>{
	Giveaway = db.collection('giveaway')
	let data = []
	for (let i of json){
		if (i['phone']){
			data.push({
				phone: i['phone'],
				items:{
					type: parseInt(i['type']),
					qty: parseInt(i['qty'])
				},
				createdTime: new Date(),
				exchanged: false,
				exchangedTime: null,
				group:'凡博瑜伽'
			})
		}
	}
	console.log(data)

	Giveaway.insertMany(data).then()


}).catch(err=>{
	console.log(err)
})
