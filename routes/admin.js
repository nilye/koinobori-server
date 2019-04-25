const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const config = require('../util/config')
const db = require('../db').db()
const Ticket = db.collection('ticket')

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

router.use('/checkin', function(req, res){
	let code = req.query['code'] || req.query['text']
	const io = req.app.get('socketio');
	Ticket.findOneAndUpdate({code}, {$set:{
		checked: true,
		checkedTime: new Date(),
	}}, {
		returnOriginal: false
	}).then(ticket=>{
		if (ticket.lastErrorObject.n === 1){
			io.sockets.to(code).emit('checked-in', true)
			res.json({code: 1, msg:'checked in'})
		} else {
			res.status(400).json({code:0})
		}
	}).catch(err=>{
		res.status(400).json({code:0})
	})
})

router.use('/testsocket', function(req, res){
	const io = req.app.get('socketio'),
		room = req.query['room']
	io.sockets.to(room).emit('checkin', true)
	res.json({code:1})
})

module.exports = router;