const which = require('which');
const locales = require('./locales');
const exec = require('child_process').execFileSync;

const npm = which.sync('npm');

Object.keys(locales).forEach((localeName) => {
  console.log('Building for locale', localeName, '...');
  exec(npm, ['run', 'build'], { env: { WP_LOCALE: localeName }, shell: true });
  exec('cp', [`dist/accessibility.cloud.${localeName}.min.js`, `dist/accessibility.cloud.${localeName}-${process.env.npm_package_version}.min.js`]);
  exec('rm', [`dist/accessibility.cloud.${localeName}.min.js`]);
});
