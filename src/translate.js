import translations from './translations/accessibility-cloud.js-widget/translations';

const defaultLocale = 'en_US';

function findLocaleWithCountry(localeWithoutCountry) {
  const regexp = new RegExp(`^${localeWithoutCountry}_`);
  return Object.keys(translations).find(locale => locale.match(regexp));
}

export function translateWithObject(object, locale) {
  const localeWithoutCountry = locale.replace(/_[A-Z][A-Z]$/);
  const localeHasCountry = locale !== localeWithoutCountry;
  const localeWithDefaultCountry = localeHasCountry ? locale : findLocaleWithCountry(locale);

  const result = object[locale] ||
    object[localeWithoutCountry] ||
    object[localeWithDefaultCountry] ||
    object[defaultLocale] ||
    `(No translation for ${locale})`;

  return result;
}

function translate(string, locale) {
  const localeWithoutCountry = locale.replace(/_[A-Z][A-Z]$/);
  const localeHasCountry = locale !== localeWithoutCountry;
  const localeWithDefaultCountry = localeHasCountry ? locale : findLocaleWithCountry(locale);

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

let locale = defaultLocale;
export function setGlobalLocale(newLocale) {
  locale = newLocale;
}

// eslint-disable-next-line import/prefer-default-export
export function t(arg) {
  // eslint-disable-next-line no-undef
  return translate(arg, locale);
}
