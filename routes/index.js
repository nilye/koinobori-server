const express = require('express');
const router = express.Router();
const config = require('../util/config')
const request = require("request");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({code: "1"})
});

// http://api.koinobori.design/admin/checkin?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1IjoiX2tvaW5vYm9yaSIsImlhdCI6MTU1NTg3MjkwNn0.3SpYzTs4_tdTpgjZzsy5kDuHz1mG8ooyjKE-UuQrI-M

router.get('/login/user', function(req, res, next) {
  request({
    url: 'https://api.weixin.qq.com/sns/jscode2session',
    method: 'GET',
    qs: {
      appid: config.appId,
      secret: config.secret,
      js_code: req.query['code'],
      grant_type: 'authorization_code'
    },
    json: true
  }, function (error, response, body) {
    if (error) {
      res.json({code:0, msg: 'error'})
    }
    res.json({code:1, data: body['openid']})
  })
});

module.exports = router;
