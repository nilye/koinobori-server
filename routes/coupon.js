const express = require('express');
const router = express.Router();
const db = require('../db').db()
const Coupon = db.collection('coupon')

router.get('/verify', function(req, res){
	let code = req.query['code']
	Coupon.findOne({code}).then(ticket=>{
		if (ticket){
			res.json({code: 1, msg:'ok', data:{
					code: ticket.code,
					name: ticket.name,
					discount: ticket.discount
				}
			})
		} else {
			res.status(200).json({code:0})
		}
	})
})


module.exports = router;