const fs = require('fs');
const path = require('path');

const locales = {};
const localeDirPath = path.join(__dirname, '../translations/accessibility-cloud.js-widget');

fs.readdirSync(localeDirPath)
  .forEach((file) => {
    console.log('Found locale file:', file);
    const localeName = file.match(/([a-z][a-z]_[A-Z][A-Z]).po$/)[1];
    locales[localeName] = path.join(localeDirPath, file);
  });

console.log('Found locales:', locales);

module.exports = locales;
