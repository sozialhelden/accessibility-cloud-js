const fs = require('fs');
const path = require('path');

const locales = {};
const localeDirPath = path.join(__dirname, '../src/translations/accessibility-cloud.js-widget');

fs.readdirSync(localeDirPath)
  .forEach((fileName) => {
    if (!fileName.match(/\.po$/)) { return; }
    console.log('Found locale file:', fileName);
    const localeName = fileName.match(/([a-z][a-z](_[A-Z][A-Z])?).po$/)[1];
    locales[localeName] = path.join(localeDirPath, fileName);
  });

// console.log('Found locales:', locales);

module.exports = locales;
