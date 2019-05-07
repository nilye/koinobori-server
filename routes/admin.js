const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const config = require('../util/config')
const db = require('../db').db()
const Ticket = db.collection('ticket')
const Giveaway = db.collection('giveaway')
const Coupon = db.collection('coupon')

router.use('/login', function (req, res, next) {
	let passcode = req.body.passcode || req.headers['authorization'],
		token;
	if (!passcode){
		return res.json({code:0})
	}
	// is jwt token
	if (passcode.length > 20){
		jwt.verify(passcode, config.jwtSecret, function (err, decoded) {
			if (!err && decoded.t){
				return res.json({code:1, data:{
					userType: decoded.t,
				}})
			}
			return res.json({code:0})
		})
	}
	// is admin
	else if (passcode === 'liyuqi2019_'){
		token = jwt.sign({u:config.jwtPayload.u, t:'admin'}, config.jwtSecret)
		return res.json({code:1, data:{
			userType:'admin',
			token
		}})
	}
	// is distributor instead ?
	else {
		Coupon.findOne({code: passcode}).then(ticket=>{
			if (ticket && passcode === ticket.code){
				token = jwt.sign({u:ticket.code, t:'distributor'}, config.jwtSecret)
				return res.json({code:1, data:{
					userType:'distributor',
					token
				}})
			}
			return res.json({code:0})
		})
	}
})

// auth guard
router.use(function (req, res, next) {
	if (req.path === '/login'){
		return next()
	}
	let token = req.body.token || req.query.token || req.headers['authorization']
	if (!token){
		return res.status(403).json({code:0})
	} else {
		jwt.verify(token, config.jwtSecret, function (err, decoded) {
			if (err) {
				return res.status(403).json({code:0})
			}
			if (decoded.u === config.jwtPayload.u){
				return next()
			}
			return res.status(403).json({code:0})
		})
	}
})


/*
* code / text
* token
*/
router.use('/checkin', function(req, res){
	let code = req.query['code'] || req.query['text']
	const io = req.app.get('socketio');
	Ticket.findOne({code}).then(ticket=>{
		if (!ticket){
			return res.status(400).json({code:0})
		}

		let now = new Date().getTime(),
			checkedTime = ticket['checkedTime'] ? ticket['checkedTime'].getTime() : now
		// if ticket is checked 2 hours before, restrict entry
		console.log((now - checkedTime)/1000/60/60)
		if (ticket['checked'] === true
			&& (now - checkedTime) > (1000*60*60*3)){
			return res.status(400).json({code:1, msg:'已结束'})
		} else {
			Ticket.findOneAndUpdate({code}, {$set:{
					checked: true,
					checkedTime: ticket['checkedTime'] || new Date(),
				}}, {
				returnOriginal: true
			}).then(result=>{
				if (result.ok === 1){
					console.log('checked-in')
					io.sockets.to(code).emit('checked-in', true)
					return res.status(200).json({code: 1, msg:'ok'})
				} else {
					return res.status(400).json({code:0})
				}
			}).catch(err=>{
				return res.status(400).json({code:0})
			})
		}
	})
})


/*
* data: [{
*   phone
*   items
* }]
*/
router.post('/giveaway', function(req, res){
	let reqData = req.body
	let data = reqData.data.map(i=>{
		 let g = {
			items: {
				type:i.type,
				qty:i.qty
			},
			phone: i.phone,
			createdTime: new Date(),
			exchanged:false,
			exchangedTime: null,
		}
		if (reqData.group){
			g.group = reqData.group
		}
		return g
	})
	Giveaway.insertMany(data).then(result=>{
		res.json({code:1, data:[], msg:'ok'})
	}).catch(err=>{
		console.log(err)
		res.json({code:0, data:[], msg:'error'})
	})
})

module.exports = router;