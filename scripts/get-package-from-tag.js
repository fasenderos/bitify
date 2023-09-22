const { exec } = require("child_process");

const tagName = process.argv[2];
const packageName = /\(([^)]+)\)/.exec(tagName)[1];

exec("pnpm m ls --json --depth=-1", (_, packages) => {
  // log the path so it can be captured from the bash script
  console.log(JSON.parse(packages).find((x) => x.name === packageName).path);
});
