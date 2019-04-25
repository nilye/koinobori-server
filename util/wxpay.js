const config = require('./config')
const md5 = require('md5');
const nanoid = require('nanoid/generate')

module.exports = exports = {}

exports.createNonceStr = function () {
	return Math.random().toString(36).substr(2, 15);
}

exports.timestamp = function () {
	return Math.round(new Date().getTime()/1000)
}

exports.orderSign = function (data) {
	let obj = {
		appid: config.appId,
		body: data['body'],
		mch_id: config.mchId,
		nonce_str: data['nonce_str'],
		notify_url: config.notifyUrl,
		openid: data['openid'],
		out_trade_no: data['out_trade_no'],
		spbill_create_ip: data['spbill_create_ip'],
		total_fee: data['total_fee'],
		trade_type: 'JSAPI'
	}
	let stringSignTemp = urlParser(obj) + '&key=' + config.mchKey
	return md5(stringSignTemp).toUpperCase()
}

exports.paySign = function (data) {
	let obj = {
		appId: config.appId,
		nonceStr: data.nonceStr,
		package: data.package,
		signType: data.signType,
		timeStamp: data.timeStamp
	}
	let stringSignTemp = urlParser(obj) + '&key=' + config.mchKey
	return md5(stringSignTemp).toUpperCase()
}

exports.createOrderNo = function () {
	return 'yz'+nanoid('1234567890', 18)
}

exports.xmlBuilder = function (params) {
	let xml = "<xml>"
	for (let key in params){
		xml += '<'+key+'>'+params[key]+'</'+key+'>'
	}
	xml += '</xml>'
	return xml
}

exports.stringToDate = function (str) {
	let y = str.substr(0,4),
		m = str.substr(4,2),
		d = str.substr(6,2),
		h = str.substr(8,2) || 0,
		mi = str.substr(10,2) || 0,
		s = str.substr(12,2) || 0;
	return new Date(y,m,d,h,mi,s)
}


function urlParser(args){
	let keys = Object.keys(args)
	keys = keys.sort()
	let newArgs = {}
	keys.forEach(function(key){
		newArgs[key] = args[key]
	})
	let str = ''
	for (let p in newArgs){
		str += '&'+p+'='+newArgs[p]
	}
	str = str.substr(1)
	return str
}