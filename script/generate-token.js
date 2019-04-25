const jwt = require('jsonwebtoken')
const fs = require('fs')
const config = require('../util/config')

let token = jwt.sign(config.jwtPayload, config.jwtSecret)
fs.writeFileSync('./script/token', token, function (err) {
	if (err) throw err
	console.log('token generated')
})