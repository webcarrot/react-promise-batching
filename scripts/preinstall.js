"use strict";

const fs = require("fs");
const path = require("path");
const distributionDirPath = path.join(__dirname, "../distribution");
const rootDirPath = path.join(__dirname, "../");
try {
  const files = fs.readdirSync(distributionDirPath);
  files.forEach(file => {
    fs.renameSync(path.join(distributionDirPath, file), path.join(rootDirPath, file));
  });
  fs.rmdirSync(distributionDirPath);
} catch (_) {
  // ignore
}
