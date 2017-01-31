import translations from './translations/accessibility-cloud.js-widget/translations';

function findLocaleWithCountry(localeWithoutCountry) {
  const regexp = new RegExp(`^${localeWithoutCountry}_`);
  return Object.keys(translations).find(locale => locale.match(regexp));
}

function translate(string, locale) {
  const localeWithoutCountry = locale.replace(/_[A-Z][A-Z]$/);
  const localeHasCountry = locale !== localeWithoutCountry;
  const localeWithDefaultCountry = localeHasCountry ? locale : findLocaleWithCountry(locale);
  const defaultLocale = 'en_US';

  const translation = translations[locale] || {};
  const translationWithoutCountry = translations[localeWithoutCountry] || {};
  const translationWithDefaultCountry = translations[localeWithDefaultCountry] || {};
  const translationWithDefaultLocale = translations[defaultLocale] || {};

  const result = translation[string] ||
    translationWithoutCountry[string] ||
    translationWithDefaultCountry[string] ||
    translationWithDefaultLocale[string] ||
    string;

  return result;
}

// Note that we don't support template strings for now.

let locale = 'en_US';
export function setGlobalLocale(newLocale) {
  locale = newLocale;
}

// eslint-disable-next-line import/prefer-default-export
export function t(arg) {
  // eslint-disable-next-line no-undef
  return translate(arg, locale);
}
