const express = require('express');
const router = express.Router();
const TicketOps = require('../util/ticket')

const db = require('../db').db()
const Ticket = db.collection('ticket')

/*
* orderNo
* paySign
* openid
* */
router.post('/issue/wxpay', async function(req, res){
	const reqBody = req.body
	if (!reqBody.orderNo || !reqBody.paySign || !reqBody.openid){
		res.json({code:0, msg:'invalid params'})
	}
	TicketOps.createTicketFromOrder(reqBody).then(ticket=>{
		res.json({code:1, data: ticket, msg:'ok'})
	}).catch(err=>{
		res.json({code:0, msg: err})
	})
})

router.get('/list', function (req, res) {
	const openid = req.query['openid']
	if (!openid){
		res.json({code:0})
	}
	Ticket.find({openid}).sort({checked:1, createdTime:-1}).toArray().then(tickets=>{
		res.json({code:1, data:tickets, msg:'ok'})
	})
})

module.exports = router;