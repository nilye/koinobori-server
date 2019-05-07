const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const config = require('../util/config')
const Stats = require('../util/stats')

router.use(function (req, res, next) {
	let token = req.headers['authorization'] || req.body.token || req.query.token
	if (!token){
		res.status(403).json({code:0})
	} else {
		jwt.verify(token, config.jwtSecret, function (err, decoded) {
			if (decoded
				&& decoded.u === config.jwtPayload.u
				&& decoded.t === 'admin'){
				return next()
			}
			return res.status(403).json({code:0})
		})
	}
})

// distributor
router.get('/distributor/all', function(req, res){
	Stats.distributor.updateAll().then(()=>{
		return Stats.distributor.getAll()
	}).then(result => {
		return res.json({code:1, data:result})
	})
})
router.get('/distributor/:code', function(req, res, next){
	Stats.distributor.getOne(req.params.code).then(updated=>{
		if (updated){
			return res.json({code:1, data:updated})
		}
		return res.json({code:0})
	})
})

// check in
router.get('/checkin/day', function (req, res) {
	let start = req.query.start, end = req.query.end
	if (!start || !end){
		return res.json({code:0})
	}
	Promise.all([
		Stats.checkin.byDay(start, end),
		Stats.checkin.total()
	]).then(data=>{
		return res.json({code:1,
			data:{
				total: data[1],
				series: data[0]
			}
		})
	})
})

// sales (bought from mini-app)
router.get('/sale/total', function (req, res) {
	Stats.sale.total().then(result=>{
		return res.json({code:1, data:result})
	})
})
router.get('/sale/byDay', function (req, res) {
	
})
router.get('/sale/byTimeOfDay', function (req, res) {
	
})

module.exports = router;