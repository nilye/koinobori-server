const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const config = require('../../util/config')

/*
user levels
distr 商户
staff 员工
admin 管理员
*/

//
router.use('/distr', function (req, res, next) {
	authorize('distr').then(()=>{
		next()
	}).catch(err=>{
		res.status(403).json({code:0})
	})
})

router.use('/admin', function (req, res, next) {
	authorize('admin').then(()=>{
		next()
	}).catch(err=>{
		res.status(403).json({code:0})
	})
})


function authorize(userType){
	return new Promise((resolve, reject)=>{
		let token = req.body.token || req.query.token || req.headers['Authorization']
		if (!token){
			reject('unauthorized')
		} else {
			jwt.verify(token, config.jwtSecret, function (err, decoded) {
				if (decoded
					&& decoded.u === config.jwtPayload.u
					&& decoded.t === userType){
					resolve()
				}
				reject(err)
			})
		}
	})
}


const Distributor = require('./distributor')
router.get('/distr/', Distributor)

module.exports = router;