const pipelines = {
	couponStats: function (code) {
		return[
			{ $match: { coupon: code ? code : { $ne: null } } },
			{ $group: {
					_id: '$orderNo',
					orderCount: { $sum: 1 },
					items: { $first: '$items' },
					coupon:{ $first:'$coupon' },
					phone:{ $first: '$phone' },
				}
			},
			{ $unwind: { path: '$items' } },
			{ $group: {
					_id: '$coupon',
					orderCount: { $sum: '$orderCount' },
					usedCount: { $sum: '$items.qty' },
					usedItems: { $push: {
						items: '$items',
						phone: { $substr: ['$phone', 7, 11] }
					}}
				}
			},
			{ $lookup: {
					from: 'coupon',
					localField: '_id',
					foreignField: 'code',
					as: 'couponInfo'
				}
			},
			{ $unwind: { path: '$couponInfo' } },
			{ $match: { 'couponInfo.test': null } }
		]
	},

	checkinTotal: function () {
		return [
			{ $match: { checked: true } }, 
			{ $group: {
					_id: 'total',
					total: { $sum: '$items.type' }
				}
			}
		]
	},
	
	checkinByDay: function (start, end) {
		return [
			{ $match: {
					checked: true,
					checkedTime: {
						$gte: new Date(start+'T00:00:00Z'),
						$lt: new Date(end+'T23:59:59Z')
					}
				}
			},
			{ $project: {
					_id: '$_id',
					items: '$items',
					source:'$source',
					checkedDate: {
						$dateToString: { date: '$checkedTime', format: "%Y-%m-%d" }
					}
				}
			},
			{ $group: {
					_id: '$checkedDate',
					count: { $sum: '$items.type' },
					items: { $push: {
							type: '$items.type',
							qty: '$items.qty',
							source: '$source'
						}
					}
				}
			},
			{ $sort: {_id: 1}}
		]
	},

	salesTotal: function () {
		return [
			{ $match: { payed: true } },
			{ $unwind: { path: '$items' } },
			{ $group: {
					_id: "$items.type",
					count: { $sum: '$items.qty' }
				}
			},
			{ $project: {
					type:'$_id',
					count:'$count',
					ppl: { $multiply:['$count', '$_id'] }
				}
			}
		]
	},

	salesByDay: function () {
		return []
	}
}

module.exports = pipelines