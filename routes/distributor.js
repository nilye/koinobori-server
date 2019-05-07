const express = require('express');
const router = express.Router();
const config = require('../util/config')
const jwt = require('jsonwebtoken')
const Stats = require('../util/stats')
const db = require('../db').db()
const Coupon = db.collection('coupon')

router.get('/', function(req, res, next){
	jwt.verify(req.headers['authorization'], config.jwtSecret, function (err, decoded) {
		if (!err && decoded.t === 'distributor'){
			Stats.distributor.getOne(decoded.u).then(updated=>{
				if (updated){
					res.json({code:1, data:updated})
				} else {
					Coupon.findOne({code: decoded.u}).then(result=>{
						res.json({code:1, data:result})
					})
				}
			})
		} else {
			res.json({code:0, data:[]})
		}
	})
})

module.exports = router