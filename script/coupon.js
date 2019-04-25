const nanoid = require('nanoid')
const fs = require('fs')

let coupons = ''
for (let i = 0; i<50; i++){
	let id = nanoid(6)
	coupons += `${id}\n`
}

fs.writeFileSync('./script/coupons', coupons, (err)=>{
	if (err) throw err
	console.log('generated coupons')
})