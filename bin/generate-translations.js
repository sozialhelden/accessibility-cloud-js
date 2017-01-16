const fs = require('fs');
const path = require('path');
const locales = require('./locales');
const gettextParser = require('gettext-parser');

const translationsDirName = path.join(__dirname, '../translations/accessibility-cloud.js-widget');
const translationsFileName = path.join(translationsDirName, 'translations.js');
const parsedPOFiles = {};

function getTranslationsFromPoData(poData) {
  const result = {};
  // console.log(poData.translations['']);
  Object.keys(poData.translations['']).forEach((msgid) => {
    if (msgid === '') { return; }
    const msgstr = poData.translations[''][msgid].msgstr[0];
    if (msgstr) {
      result[msgid] = msgstr;
    }
  });
  return result;
}

function writeTranslationsModule() {
  const singlePoFileJS = (locale) => {
    const jsonString = JSON.stringify(getTranslationsFromPoData(parsedPOFiles[locale]));
    return `  ${locale}: ${jsonString},`;
  };
  const allPoFilesJS = Object.keys(parsedPOFiles).map(singlePoFileJS).join('\n');
  const exportDefinitionJS = `const translations = {\n${allPoFilesJS}\n};`;
  const exportJS = 'export default translations;';
  const translationsModuleContent =
    `${exportDefinitionJS}\n\n${exportJS}\n`;
  fs.writeFile(translationsFileName, translationsModuleContent, (error) => {
    if (error) {
      console.error('Could not write', translationsFileName, error, error.stack);
      return;
    }
    console.log('Done.');
  });
}

function readPoFile(locale, poFileName) {
  console.log('Reading', poFileName, '...');
  fs.readFile(poFileName, 'utf8', (error, poFileContent) => {
    if (error) {
      console.error('Could not read', poFileName, error, error.stack);
      return;
    }
    console.log('Parsing', poFileName, '...');
    parsedPOFiles[locale] = gettextParser.po.parse(poFileContent);
    if (Object.keys(parsedPOFiles).length === Object.keys(locales).length) {
      writeTranslationsModule();
    }
  });
}

Object.keys(locales).forEach((locale) => {
  const poFileName = locales[locale];
  readPoFile(locale, poFileName);
});
