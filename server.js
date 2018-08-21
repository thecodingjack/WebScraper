var express = require('express');
var fs = require('fs');
const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: false })
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.use(express.static(__dirname))

app.get('/scrape', (req,res)=>{
  // var colors = ['white', 'black', 'blue', 'green', 'yellow', 'red', 'orange', 'purple', 'pink', 'gray']
  // var clothings = ['shirt', 'pants', 'jeans', 'hoodie', 'jacket', 'shorts', 'hat', 'socks', 'dress', 'shoes']
  // var colors = ['women']
  // var clothings = ['t-shirt', 'casual-shirt', 'plaid-shirt','dress-shirt', 'polo', 'hoodie', 'sweater', 'cardigan', 'blouse', 'tank-top', 'tube-top', 'halter-top','cocktail-dress', 'formal-dress', 'maxi-dress', 'jeans', 'pants', 'sweatpants', 'shorts', 'joggers', 'skirt', 'suit-pants', 'bomber-jacket', 'midweight-jacket', 'denim-jacket', 'parka', 'puffer', 'vest', 'coat', 'suit-jacket', 'suit-vest', 'faux-fur-coat']
  var keywords = ['women leggings']
  // colors.forEach(color=>clothings.forEach(clothing=> keywords.push(`${color} ${clothing}`)))
  var entry = `https://images.google.com/`
  keywords.reduce(function(accumulator, keyword) {
    var results = []
    // var tags = keyword.split(" ")
    return accumulator.then(function() {
      return nightmare.goto(entry)
        .wait('body')
        .type('#lst-ib', `${keyword}\u000d`)
        .evaluate(()=> (document.querySelector('body').innerHTML))
        .then((html)=>{
          var $ = cheerio.load(html);
          $('.rg_ic').filter((i,el)=>{
            var data = $(el)
            var imageUrl = data.attr('data-src')
            if(imageUrl) results.push(imageUrl)
          })
          let promises = []
          console.log({keyword})
          fs.mkdir(`${__dirname}/clothings/${keyword}`,(err)=>{
            results.forEach((image,idx)=>{
              let newPromise = new Promise((resolve,reject)=>{
                var tag = keyword.split(" ").join("_")
                request(image)
                  .on('error',(err)=>resolve())
                  .pipe(fs.createWriteStream(`./clothings/${keyword}/${tag}_${idx}.jpg`)).on('close', ()=> resolve(""))
              })
              promises.push(newPromise)
            })
            Promise.all(promises).then(()=>console.log('finished'))
          })
        })
    });
  }, Promise.resolve([])).then(()=>res.send(results));
})

app.listen('8083')

console.log('Magic happens on port 8082');

module.exports = app;