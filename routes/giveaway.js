const express = require('express');
const router = express.Router();
const TicketOps = require('../util/ticket')

const db = require('../db').db()
const Giveaway = db.collection('giveaway')

/*
* openid
* phone
* userInfo
*/

router.post('/phone', function(req, res){
	let reqBody = req.body
	if (!reqBody.phone || !reqBody.openid || !reqBody.userInfo){
		res.json({code:1, data:[], msg:'invalid params'})
	}
	TicketOps.signin(reqBody)
	Giveaway.find({phone: reqBody.phone, exchanged:false}).sort({createdTime:-1}).toArray().then( async tickets => {
		if (tickets.length > 0) {
			let items = tickets.map(i => i.items)
			try {
				let data = {
					orderNo: null,
					openid: reqBody.openid,
					phone: reqBody.phone,
					items: items
				}
				Giveaway.updateMany({ phone: reqBody.phone, exchanged: false }, {
					$set: { exchanged: true, exchangedTime: new Date() }
				})
				let tickets = await TicketOps.createTicketFromGiveaway(data)
				res.json({ code: 1, data: tickets, msg: 'ok' })
			} catch (err) {
				console.log(err)
				res.json({ code: 1, data: [], msg: 'ok' })
			}
		} else {
			res.json({ code: 1, data: [], msg: 'ok' })
		}
	})
})


module.exports = router;