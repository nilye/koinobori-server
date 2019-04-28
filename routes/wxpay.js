const express = require('express');
const router = express.Router();
const config = require('../util/config')
const wxpay = require('../util/wxpay')
const TicketOps = require('../util/ticket')
const request = require("request");
const xml2js = require('xml2js').parseString

const db = require('../db').db()
const Order = db.collection('order')


function createOrder(orderNo, {items, openid, fee, phone, coupon}, prepayId, paySign){
	return new Promise((resolve, reject)=>{
		Order.insertOne({
			orderNo, openid, items, fee, prepayId, phone, paySign, coupon,
			createdTime: new Date(),
			payed:false,
			payedTime:null,
			wxTransactionId:null
		}).then(order=> resolve(order.ops[0]))
			.catch(err=> reject(err))
	})
}

/*
* openid
* phone
* userInfo
* fee
*/

router.post('/order', function(req, res) {
	const reqBody = req.body,
		orderNo = wxpay.createOrderNo();
	if (!reqBody.openid || !reqBody.phone){
		res.json({code:0, msg:'invalid params'})
	}
	let params = {
		appid: config.appId,
		body: config.goodsBody,
		mch_id: config.mchId,
		nonce_str: wxpay.createNonceStr(),
		notify_url: config.notifyUrl,
		openid: reqBody['openid'],
		out_trade_no: orderNo,
		spbill_create_ip: req.ip.replace(/::ffff:/, ''),
		total_fee: reqBody['fee'],
		trade_type: 'JSAPI'
	}
	params['sign'] = wxpay.orderSign(params)

	// weixin unified order
	request({
		url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
		method: 'POST',
		body: wxpay.xmlBuilder(params)
	}, function (error, _response, body) {
		if (!error && res.statusCode === 200){
			xml2js(body, async function (err, result) {
				let resData = {}, payData = result.xml
				if (!err && payData['result_code'][0] === 'SUCCESS' ){
					// format xml to json
					resData.timeStamp = wxpay.timestamp()
					resData.nonceStr = payData.nonce_str[0]
					resData.package = 'prepay_id=' + payData.prepay_id[0]
					resData.signType = 'MD5'
					resData.sign = payData.sign[0]
					resData.paySign = wxpay.paySign(resData)
					// create order and sign in user
					try {
						let dbData = await Promise.all([
							TicketOps.signin(reqBody),
							createOrder(orderNo, reqBody, payData.prepay_id[0], resData.paySign)
						])
						// console.log(resData)
						// console.log(dbData)
						// response success
						res.json({code:1, data: {
							payParams: resData,
							orderNo: orderNo
						}, msg: 'ok'})
					} catch (err) {
						res.json({code:0, msg: 'ERROR'})
					}
				} else {
					res.json({code:0, msg: payData['err_code_des']})
				}
			})
		}
	})
});

// wxpay result notify
// https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=9_7
router.all('/pay', function (req, res, next) {
	const reqBody = req.body.xml
	if (reqBody['result_code'] === 'SUCCESS'){
		let orderNo = reqBody['out_trade_no']
		// update order
		Order.findOneAndUpdate({orderNo}, {$set:{
			payed:true,
			payedTime: wxpay.stringToDate(reqBody.time_end),
			wxTransactionId: reqBody.transaction_id
		}},{
			returnOriginal: false
		}).then(order=> {
			// check if ticket is issued
			return TicketOps.createTicketFromOrder(order.value)
		}).then(()=>{
			// response wx server
			res.set('Content-Type', 'text/xml')
			res.status(200).send('<xml>\n' +
				'  <return_code><![CDATA[SUCCESS]]></return_code>\n' +
				'  <return_msg><![CDATA[OK]]></return_msg>\n' +
				'</xml>')
		}).catch(err =>{
			res.status(400).send('error')
		})
	}
})

// route.post('/orderquery')


module.exports = router;
