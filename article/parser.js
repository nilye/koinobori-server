const fs = require('fs'),
  weRich = require('we-rich'),
  showdown  = require('showdown'),
  converter = new showdown.Converter();

const md = fs.readFileSync('src/article/1.md','utf8')
let html = converter.makeHtml(md).replace(/\n/g, '<br>').replace(/\<img/gi, '<img style="max-width:100%;height:auto;display:block;"');
console.log(html)


let json = weRich.parse(html)

json = JSON.stringify(json).replace(/\"([^(\")"]+)\":/g,"$1:").replace(/text:\"([^(\")"]+)\"/g, "text:`$1`")

fs.writeFile('src/article/content.js', `export default ${json} ` , function (err) {
  if (err) throw err
  console.log('Html to rich-texrt Json => ./article/content.js')
})
