var xj = require("xls-to-json");

xj({
	input:'./script/giveaways/凡博瑜伽.xlsx',
	output:'./script/giveaways/5-1.json',
	sheet:'Sheet1',
}, function (err, result) {
	if (err){
		console.log(err)
	} else {
		console.log(result)
	}
})

