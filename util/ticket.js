const nanoid = require('nanoid')
const db = require('../db').db()
const Order = db.collection('order')
const Ticket = db.collection('ticket')

module.exports = exports = {}

function createTicket(order, source) {
	return new Promise((resolve, reject) => {
		Ticket.insertOne({
			code: nanoid(11),
			createdTime: new Date(),
			checked: false,
			checkedTime: null,
			items: order.items,
			orderNo: order.orderNo,
			openid: order.openid,
			phone: order.phone,
			source: source,
			fee: order.fee
		}).then(newTicket => {
			resolve(newTicket.ops[0])
		})
	})
}

exports.createTicketFromOrder = function(req){
	return new Promise((resolve, reject) => {
		Ticket.findOne({orderNo: req.orderNo }).then(ticket => {
			if (ticket) {
				resolve(ticket)
			} else {
				createTicket(req, 'wxpay').then(newTicket => {
					resolve(newTicket)
				}).catch(err=>reject(err))
			}
		})
	})
}