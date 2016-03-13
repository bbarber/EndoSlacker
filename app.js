var express = require('express');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var app = express();

app.get('/', function (req, res) {
    var url = 'https://www.endomondo.com/challenges/27408592';
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            var names = $('td .name').map(function (i, a) {
                return a.children[0].data.replace('Norm', 'Nick');
            });

            var maxLength = 0;
            for (var i = 0; i < names.length; i++) {
                if (names[i].length > maxLength)
                    maxLength = names[i].length;
            }

            // Pad names so scores right align
            names = names.map(function (i, a) {
                return a + Array(maxLength - a.length + 1).join(' ');
            });

            var scores = $('.nose').map(function (i, a) {
                return a.children[0].data;
            });

            var arr = scores.map(function (i, score) {
                return names[i] + ' - ' + score;
            });

            var list = [];
            for (var i = 0; i < arr.length; i++) {
                list.push(arr[i])
            }

            var body = list.join('\r\n');

            fs.readFile("last.txt", 'utf8', function (err, last) {
                if (err && err.code !== 'ENOENT')
                    throw err;

                if (last !== body) {

                    fs.writeFile("last.txt", body, function (err) {
                        if (err) {
                            return console.log(err);
                        }

                        var params = '?token=' + process.env.token + '&channel=%23' + process.env.channel;
                        var options = {
                            url: 'https://dontpaniclabs.slack.com/services/hooks/slackbot' + params,
                            body: "```" + body + "```"
                        };

                        request.post(options);
                    });
                }

                res.send('<pre>' + body + '</pre>');
            });
        }
    })
})

app.listen(process.env.PORT || 3000)
