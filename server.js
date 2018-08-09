var express = require('express');
var fs = require('fs');
const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.use(express.static(__dirname))

app.get('/scrape', (req,res)=>{
  var results = []
  var keyword = req.query.q
  var entry = `https://images.google.com/`
  nightmare
    .goto(entry)
    .type('#lst-ib', `${keyword}\u000d`)
    .evaluate(()=> (document.querySelector('body').innerHTML))
    .end()
    .then((html)=>{
      var $ = cheerio.load(html);
      $('.rg_ic').filter((i,el)=>{
        var data = $(el)
        var imageUrl = data.attr('data-src')
        if(imageUrl) results.push(imageUrl)
      })
      let promises = []
      fs.mkdir(`${__dirname}/images/${keyword}`,(err)=>{
        results.forEach((image,idx)=>{
          let newPromise = new Promise((resolve,reject)=>{
            request(image).pipe(fs.createWriteStream(`./images/${keyword}/${idx}.png`)).on('close', ()=> resolve(""))
          })
          promises.push(newPromise)
        })
        Promise.all(promises).then(()=>res.send(results))
      })
    })
})
app.listen('8082')

console.log('Magic happens on port 8082');

module.exports = app;