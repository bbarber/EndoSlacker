var express = require('express');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var secrets = require('./secrets');
var app = express();

app.get('/scrape', function(req, res){
    var url = 'https://www.endomondo.com/challenges/26556403';
    request(url, function(error, response, html){
        console.log('request...');
        if(!error){
            var $ = cheerio.load(html);

            console.log(html);
            var names = $('td .name').map(function(i, a){
              return a.text.replace('You', 'Branden Barber');
            });

            var kcals = $('.nose').map(function(i, a){
              return a.innerHTML.replace('&nbsp;kcal', '');
            });

            var arr = scores.map(function(i, score){
              return names[i] + ' - ' + score;
            });

            var list = [];
            for(var i = 0; i < arr.length; i++)
            {
              list.push(arr[i])
            }

            var body = list.join('\r\n');
            console.log(body);
            console.log(secrets.slack.token);
            console.log(secrets.slack.channel);

            var params = '?token=' + secrets.slack.token + '&channel=%23' + secrets.slack.channel;
                var options = {
                    url: 'https://dontpaniclabs.slack.com/services/hooks/slackbot' + params,
                    body: body
                };

            request.post(options);
        }
    })
})

app.listen('3000')
