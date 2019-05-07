const mongodb = require('mongodb')

// const url = 'mongodb://koinobori:liyuqi0501@localhost:27017';
const url = 'mongodb://koinobori:liyuqi0501@101.37.246.38:27017';
// const url = 'mongodb://localhost:27017';
const MongoClient = new mongodb.MongoClient(url, {
	poolSize:10,
	useNewUrlParser: true
})
// const dbName = "yozai-test"
const dbName = "yozai"

let _db

const initDb = new Promise((resolve, reject) => {
	if (_db) resolve(_db)
	MongoClient.connect().then(client=>{
		_db = client.db(dbName)
		console.log('mongodb initialized ' + dbName)
		resolve(_db)
	}).catch(err=>{
		reject(err)
	})
})

const db = () => {
	if (!_db) throw Error('db is not connnected')
	return _db
}

module.exports = {initDb, db}
