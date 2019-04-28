const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
const http = require('http');
const logger = require('morgan');
const initDb = require('./db').initDb
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.xml({
	limit: "1MB",
	xmlParseOptions: {
		normalize: true,
		normalizeTags: true,
		explicitArray: false
	}
}));
app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
	next();
});

app.use(express.static(path.join(__dirname, 'public')));

// port & server
const server = http.createServer(app);
const port = (process.env.PORT || '3000');
app.set('port', port);

// io
const io = require('socket.io')(server)
io.sockets.on('connect', function(socket){
	socket.on('channel', (channel)=>{
		console.log('socket joined ' + channel)
		socket.join(channel)
	})
	socket.on('disconnect', function (socket) {
		console.log('a socket disconnect')
	})
})
app.set('socketio', io)

function initRoutes(){
	const indexRouter = require('./routes/index');
	const wxpayRouter = require('./routes/wxpay');
	const ticketRouter = require('./routes/ticket');
	const couponRouter = require('./routes/coupon');
	const giveawayRouter = require('./routes/giveaway');
	const adminRouter = require('./routes/admin');
	app.use('/', indexRouter);
	app.use('/wxpay', wxpayRouter)
	app.use('/ticket', ticketRouter)
	app.use('/coupon', couponRouter)
	app.use('/giveaway', giveawayRouter)
	app.use('/admin', adminRouter)
}

initDb.then(()=>{
	initRoutes()
	server.listen(port)
	console.log('listening on port:' + port)
}).catch(err=>{
	console.log(err)
})
