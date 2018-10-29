const { fetchNamesAndScores } = require("./endomondo.js");
const fs = require("fs");
const _ = require("lodash");
const { promisify } = require("util");
const request = require("request");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

var SLACK_URL_TOKEN = process.env.SLACK_URL_TOKEN;
var CHALLENGE_ID = process.env.CHALLENGE_ID;

const formatBody = body => "```" + body + "```";

const fileName = __dirname + "/last.txt";
console.log(fileName);

fetchNamesAndScores(CHALLENGE_ID).then(namesAndScores => {
  const list = namesAndScores.map(
    ([name, score], index) => `${_.padStart(index + 1, 2)}: ${name} - ${score}`
  );
  const body = list.join("\n");

  readFile(fileName, "utf8")
    .catch(() => "")
    .then(last => {
      if (last !== body) {
        const payload = {
          text: formatBody(body),
          username: "Endomondo",
          icon_url:
            "https://www.endomondo.com/assets/view/layout/header/assets/ua-header@2x.3ae9f356a186d4064e9a3ee956293bb3.png"
        };

        const options = {
          url: SLACK_URL_TOKEN,
          body: JSON.stringify(payload)
        };

        return writeFile(fileName, body).then(() => {
          request.post(options);
        });
      }
    });
});
