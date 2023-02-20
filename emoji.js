import fs from "fs";

const data = JSON.parse(fs.readFileSync("./data.json"));

console.log();

console.log(data.reduce((acc, { calories }) => acc + calories, 0));

const squareSize = 103;
const squareWidth = 10;

function getEmoji(userId) {
  switch (userId) {
    case "Russ":
      return "🟩";
    case "Rob":
      return "🟦";
    case "Rich":
      return "🟨";
    case "Paul":
      return "🟥";
    case "Scott":
      return "⬛️";
    case "TJ":
      return "🟪";
    case "Adam":
      return "🟧";
    case "Edd":
      return "🟫";
  }
}

const totals = {
  Russ: 0,
  Rob: 0,
  Rich: 0,
  Paul: 0,
  Scott: 0,
  TJ: 0,
  Adam: 0,
  Edd: 0,
};

const emojis = data.reduce((acc, { userId, calories }) => {
  const length = Math.round(calories / 100);
  totals[userId] += length;
  const indexes = [...Array(length).keys()].map(() => userId);
  return acc.concat(indexes);
}, []);
console.log(totals);
const all = [
  ...emojis.map(getEmoji),
  ...[...Array(squareSize - emojis.length).keys()].map(() => "⬜️"),
];
console.log(all);
const lines = [];
let i = 0;
while (i <= squareSize) {
  const start = i;
  const end = i + squareWidth;
  lines.push(all.slice(start, end).join(""));
  i = end;
}

fs.writeFileSync("./data-emoji.json", lines.reverse().join("\n"));
