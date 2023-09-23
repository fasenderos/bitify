const { exec } = require("child_process");

// Get the package's path from a github tag name
// Github tag have the format @bitify/app-name-v0.0.1
// e.g. node ./scripts/get-pacakge-from-tag.js @bitify/app-name-v0.0.1
try {
  const tagName = process.argv[2];
  const packageName = /^(.+?)(-v[\d].[\d].[\d])/.exec(tagName)[1];

  exec("pnpm m ls --json --depth=-1", (_, packages) => {
    // log the path so it can be captured from the bash script
    console.log(JSON.parse(packages).find((x) => x.name === packageName).path);
  });
} catch (error) {
  // something wrong, log an empty string 
  console.log("");
}
