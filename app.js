const { fetchNamesAndScores } = require("./endomondo.js");
const fs = require("fs");
const _ = require("lodash");
const { promisify } = require("util");
const request = require("request");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

var SLACK_URL_TOKEN = process.env.SLACK_URL_TOKEN;
var CHALLENGE_ID = process.env.CHALLENGE_ID;

const formatBody = list => "```" + list.map(item => `${_.padStart(item.position, 2)}: ${item.name} - ${item.score} - ${item.change}`).join("\n") + "```";

const fileName = __dirname + "/last.json";
console.log(fileName);

fetchNamesAndScores(CHALLENGE_ID).then(namesAndScores => {
  console.log(namesAndScores)

  const list = namesAndScores.map(
    ([name, score], index) => ({ name, score, position: index + 1 })
  )

  readFile(fileName, "utf8")
    .catch(() => "[]")
    .then(raw => JSON.parse(raw))
    .then(last => {
      if (!_.isEqual(last, list)) {

        const comparedList = toComparedList(list, last)

        const payload = {
          text: formatBody(comparedList),
          username: "Endomondo",
          icon_url:
            "https://www.endomondo.com/assets/view/layout/header/assets/ua-header@2x.3ae9f356a186d4064e9a3ee956293bb3.png"
        };

        const options = {
          url: SLACK_URL_TOKEN,
          body: JSON.stringify(payload)
        };

        writeFile(fileName, JSON.stringify(comparedList)).then(() => {
          request.post(options);
        });
      }
    });
});

toComparedList = (list, last) => {
  return list.map(p => {
    if (p.name === '(no name provided)') {
      return { ...p, change: '-' };
    }
    const currPos = p.position;
    const lastEntryOfPerson = last.find(item => item.name === p.name);
    if (lastEntryOfPerson) {
      if (currPos < lastEntryOfPerson.position) {
        return { ...p, change: '↑' };
      }
      else if (currPos > lastEntryOfPerson.position) {
        return { ...p, change: '↓' };
      }
    }
    return { ...p, change: '-' };
  });
}

