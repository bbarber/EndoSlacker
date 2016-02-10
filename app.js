var express = require('express');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var secrets = require('secrets');
var app = express();

app.get('/scrape', function(req, res){
    var url = 'https://www.endomondo.com/challenges/26556403';
    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);

            var names = $('td .name').map(function(i, a){
              return a.text.replace('You', 'Branden Barber');
            });

            var kcals = $('.nose').map(function(i, a){
              return a.innerHTML.replace('&nbsp;kcal', '');
            });
        }
    })
})

app.listen('3000')
