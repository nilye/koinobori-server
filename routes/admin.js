const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const config = require('../util/config')
const db = require('../db').db()
const Ticket = db.collection('ticket')
const Giveaway = db.collection('giveaway')

router.use(function (req, res, next) {
	let token = req.body.token || req.query.token || req.headers['Authorization']
	if (!token){
		return res.status(400).json({code:0})
	} else {
		jwt.verify(token, config.jwtSecret, function (err, decoded) {
			if (err) {
				return res.status(400).json({code:0})
			}
			if (decoded.u === config.jwtPayload.u){
				return next()
			}
			return res.status(400).json({code:0})
		})
	}
})


/*
* code / text
* token
*/
router.use('/checkin', function(req, res){
	let code = req.query['code'] || req.query['text']
	let orderNo = req.query['orderNo'] || req.body['orderNo']
	const io = req.app.get('socketio');
	Ticket.findOneAndUpdate({ $or: [{code},{orderNo}] }, {$set:{
		checked: true,
		checkedTime: new Date(),
	}}, {
		returnOriginal: true
	}).then(result=>{
		if (result.value['checked'] === true){
			res.status(400).json({code:0, msg:'已结束'})
		} else if (result.ok === 1){
			io.sockets.to(code).emit('checked-in', true)
			res.json({code: 1, msg:'ok'})
		} else {
			res.status(400).json({code:0})
		}
	}).catch(err=>{
		res.status(400).json({code:0})
	})
})


/*
* data: [{
*   phone
*   items
* }]
*/
router.post('/giveaway', function(req, res){
	let reqData = req.body.data
	let data = reqData.map(i=>{
		return {
			items: i.items,
			phone: i.phone,
			createdTime: new Date(),
			exchanged:false,
			exchangedTime: null
		}
	})
	Giveaway.insertMany(data).then(res=>{
		res.json({code:1, data:[], msg:'ok'})
	}).catch(err=>{
		res.json({code:0, data:[], msg:'error'})
	})
})

module.exports = router;