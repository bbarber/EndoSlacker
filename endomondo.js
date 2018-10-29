const cheerio = require("cheerio");
const request = require("request");
const _ = require("lodash");

const fetchNamesAndScores = challengeId =>
  new Promise((resolve, reject) => {
    if (!challengeId) {
      reject("No challengeId provided");
    }

    const url = "https://www.endomondo.com/challenges/" + challengeId;

    request(url, function(error, response, html) {
      if (error) {
        return reject(error);
      }

      var $ = cheerio.load(html);

      var names = $("td .name")
        .map((index, el) => {
          return $(el).text();
        })
        .get();

      const maxNameLength = _.maxBy(names, "length").length;

      // Pad names so scores right align
      const paddedNames = names.map(name => _.padEnd(name, maxNameLength));

      const scores = $(".nose")
        .map((i, el) => $(el).text())
        .get();
      const maxScoreLength = _.maxBy(scores, "length").length;

      const paddedScores = scores.map(score =>
        _.padStart(score, maxScoreLength)
      );

      resolve(_.zip(paddedNames, paddedScores));
    });
  });

exports.fetchNamesAndScores = fetchNamesAndScores;
