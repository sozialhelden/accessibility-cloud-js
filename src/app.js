import Mustache from 'mustache';
import humanizeString from 'humanize-string';
import get from 'lodash/get';
import { t as translateUsingC3PO } from 'c-3po';
import { t as translateUsingGeneratedTranslations, setGlobalLocale, translateWithObject } from './translate';
import './app.css';

// If the `WP_LOCALE` environment variable is set, C3PO gets all strings from the source code
// in the build process.
const t = process.env.WP_LOCALE ? translateUsingC3PO : translateUsingGeneratedTranslations;

function formatName(name, properties) {
  const string = properties[`${name}Localized`] || humanizeString(name);
  return string.replace(/^Rating /, '');
}

function formatValue(value) {
  if (value === true) return t`Yes`;
  if (value === false) return t`No`;
  return value;
}

function formatRating(rating) {
  const between1and5 = Math.floor(Math.min(1, Math.max(0, rating)) * 5);
  const stars = '★★★★★'.slice(5 - between1and5);
  return `<span aria-label='${between1and5} stars'><span class="stars" aria-hidden='true'>${stars}</span> <span class="numeric" aria-hidden='true'>${between1and5}/5</span></span>`;
}

function recursivelyRenderProperties(properties) {
  if ($.isArray(properties)) {
    return `<ul class="ac-list">${properties.map(e => `<li>${recursivelyRenderProperties(e)}</li>`).join('')}</ul>`;
  }

  if ($.isPlainObject(properties)) {
    const propertyStrings = $.map(properties, (value, key) => {
      if (key.match(/Localized/)) {
        return '';
      }
      const name = formatName(key, properties);
      if ($.isArray(value) || $.isPlainObject(value)) {
        // if (key === 'areas' && value.length === 1) {
        //   return recursivelyRenderProperties(value[0]);
        // }
        return `<dt data-key='${key}'>${name}</dt><dd>${recursivelyRenderProperties(value)}</dd>`;
      }
      if (key.startsWith('rating')) {
        return `<dt class="ac-rating">${name}:</dt> <dd>${formatRating(parseFloat(value))}</dd>`;
      }
      return `<dt class="ac-${typeof value}">${name}:</dt> <dd class='ac-${typeof value}'>${formatValue(value)}</dd>`;
    });

    return `<dl class="ac-group">${propertyStrings.join('')}</dl>`;
  }

  return properties;
}

function isAccessible(properties) {
  return get(properties, 'accessibility.accessibleWith.wheelchair');
}

function isPartiallyAccessible(properties) {
  return get(properties, 'accessibility.isPartiallyAccessible.wheelchair');
}

export default class App {
  constructor(options) {
    const defaults = {
      apiBaseUrl: 'https://www.accessibility.cloud',
      locale: process.env.WP_LOCALE,
    };
    const opts = Object.assign(defaults, options);
    if (!opts.apiBaseUrl || !opts.apiBaseUrl.match(/^https?:\/\//)) {
      throw new Error('Please supply a valid API domain.');
    }
    if (!opts.locale || !opts.locale.match(/[a-z]{2}(_[A-Z]{2})?/)) {
      throw new Error('Please supply a valid locale.');
    }
    if (!opts.token || typeof opts.token !== 'string') {
      throw new Error('Please supply a valid app or user token.');
    }

    this.options = opts;

    if (typeof setGlobalLocale !== 'undefined') {
      setGlobalLocale(this.getLocale());
    }
  }

  getLocale() {
    return process.env.WP_LOCALE || this.options.locale;
  }

  /**
   * Calls the accessibility.cloud JSON API to get available PoIs.
   *
   * The given parameters are passed to the API's GET /place-infos endpoint.
   * More documentation is here:
   * https://github.com/sozialhelden/accessibility-cloud/blob/master/docs/json-api.md#get-place-infos
   */

  getPlacesAround(parameters, callback) {
    const stringifiedParameters = {};
    Object.keys(parameters).forEach((key) => {
      stringifiedParameters[key] = parameters[key].toString();
    });
    const noop = () => {};
    return $.ajax({
      dataType: 'json',
      url: `${this.options.apiBaseUrl}/place-infos?includeRelated=source&locale=${this.getLocale()}`,
      data: stringifiedParameters,
      headers: {
        Accept: 'application/json',
        'X-Token': this.options.token,
      },
    })
    .done(callback || noop)
    .fail(callback || noop);
  }


  infoIcon() {
    return `<svg class="ac-info-icon" width="12px" height="12px" viewBox="470 252 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <path d="M477,266 C473.134007,266 470,262.865993 470,259 C470,255.134007 473.134007,252 477,252 C480.865993,252 484,255.134007 484,259 C484,262.865993 480.865993,266 477,266 Z M475.281943,263.191051 L478.686736,263.191051 L478.686736,261.659174 L477.881662,261.659174 L477.881662,257.398991 L475.281943,257.398991 L475.281943,258.930868 L476.154107,258.930868 L476.154107,261.659174 L475.281943,261.659174 L475.281943,263.191051 Z M476.064654,255.531667 C476.064654,255.669573 476.089813,255.799092 476.14013,255.920227 C476.190447,256.041361 476.260332,256.146653 476.349785,256.236106 C476.439238,256.325559 476.54453,256.396375 476.665664,256.448556 C476.786799,256.500737 476.918181,256.526828 477.059815,256.526828 C477.193995,256.526828 477.320718,256.500737 477.439989,256.448556 C477.55926,256.396375 477.66362,256.325559 477.753073,256.236106 C477.842526,256.146653 477.913342,256.041361 477.965523,255.920227 C478.017704,255.799092 478.043795,255.669573 478.043795,255.531667 C478.043795,255.39376 478.017704,255.264241 477.965523,255.143107 C477.913342,255.021972 477.842526,254.91668 477.753073,254.827227 C477.66362,254.737774 477.55926,254.666958 477.439989,254.614777 C477.320718,254.562596 477.193995,254.536506 477.059815,254.536506 C476.918181,254.536506 476.786799,254.562596 476.665664,254.614777 C476.54453,254.666958 476.439238,254.737774 476.349785,254.827227 C476.260332,254.91668 476.190447,255.021972 476.14013,255.143107 C476.089813,255.264241 476.064654,255.39376 476.064654,255.531667 Z" id="Combined-Shape" stroke="none" fill="#000000" fill-rule="evenodd"></path>
    </svg>`;
  }

  resultsTemplate() {
    // eslint-disable-next-line no-multi-str
    return `<ul class="ac-result-list">
      {{#places}}
        <li class="ac-result {{isAccessibleClass}}" aria-controls="ac-details-{{properties._id}}" aria-expanded="false">
          <div class="ac-summary">
            <img src="${this.options.apiBaseUrl}/icons/categories/{{properties.category}}.svg"
              role="presentation"
              class="ac-result-icon">
            {{{infoPageLink}}}
            <div class="ac-result-name" role="heading">{{properties.name}}</div>
            <div class="ac-result-category">{{humanizedCategory}}</div>
            <div class="ac-result-distance"><a href='{{mapsHref}}'>{{{formattedDistance}}}</a></div>
            <div class="ac-result-accessibility-summary">{{accessibilitySummary}}{{#extraInfo}} ${this.infoIcon()}{{/extraInfo}}</div>
            <div class="ac-result-accessibility-details" aria-hidden="true" id="ac-details-{{properties._id}}">
              <header class='ac-result-extra-info'>{{extraInfo}}</header>
              {{{formattedAccessibility}}}
            </div>
          </div>
        </li>
      {{/places}}
    </ul>`;
  }

  renderPlaces(element, places, related) {
    if (!element) {
      // console.error('Could not render results, element not found.');
      return;
    }
    const locale = this.getLocale();
    if (places && places.length) {
      element.innerHTML = Mustache.render(this.resultsTemplate(), {
        places,
        humanizedCategory() {
          if (!this.properties) { return null; }
          return this.properties.localizedCategory || humanizeString(this.properties.category);
        },
        mapsHref() {
          if (!this.geometry || !this.geometry.coordinates || this.geometry.type !== 'Point') {
            return '#';
          }
          const [longitude, latitude] = this.geometry.coordinates;
          return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=20`;
        },
        formattedDistance() {
          const isImperial = locale === 'en' || locale === 'en_UK' || locale === 'en_US';
          const distance = this.properties.distance;
          let value = Math.round(distance);
          let unit = 'm';
          if (isImperial) {
            const distanceInMiles = 0.00062137 * distance;
            if (distanceInMiles < 0.1) {
              const distanceInYards = 1.0936 * distance;
              value = Math.round(distanceInYards);
              unit = 'yd';
            } else {
              value = String(0.1 * Math.round(distanceInMiles * 10)).replace(/(\.\d)\d+/, '$1');
              unit = 'mi';
            }
          }
          return `<span class='ac-result-distance-value'>${value}</span> <span class='ac-result-distance-unit'>${unit}</span>`;
        },
        formattedAccessibility() {
          return recursivelyRenderProperties(this.properties.accessibility);
        },
        extraInfo() {
          const source = related.sources && related.sources[this.properties.sourceId];
          const translations = get(source, 'translations.additionalAccessibilityInformation');
          return translations ? translateWithObject(translations, locale) : null;
        },
        isAccessibleClass() {
          return isAccessible(this.properties) ? 'is-accessible' : '';
        },
        accessibilitySummary() {
          if (isAccessible(this.properties)) {
            return t`Accessible with wheelchair`;
          }
          if (isPartiallyAccessible(this.properties)) {
            return t`Partially accessible with wheelchair`;
          }
          return t`Not accessible with wheelchair`;
        },
        infoPageLink() {
          const source = related.sources && related.sources[this.properties.sourceId];
          const sourceName = source && (source.shortName || source.name);
          if (!this.properties.infoPageUrl || !sourceName) { return ''; }
          return `<a href="${this.properties.infoPageUrl}" class="ac-result-link">${sourceName}</a>`;
        },
      });

      // prevent slideToggle for link
      const links = element.querySelectorAll('li.ac-result a');
      links.forEach(link => link.addEventListener('click', event => event.stopPropagation()));

      const results = element.querySelectorAll('li.ac-result');
      results.forEach(result => result.addEventListener('click', (event) => {
        const details = result.querySelector('.ac-result-accessibility-details');
        result.setAttribute('aria-expanded', String(result.getAttribute('aria-expanded') !== 'true'));
        details.setAttribute('aria-hidden', String(result.getAttribute('aria-hidden') !== 'true'));
      }));
    } else {
      $(element).html(`<div class="ac-no-results">${t`No results.`}</div>`);
    }
  }

  renderSourcesAndLicenses(element, sources, licenses) {
    const links = Object.keys(sources).map((sourceId) => {
      const source = sources[sourceId];
      const license = licenses[source.licenseId];
      const licenseURL = `${this.options.apiBaseUrl}/licenses/${license._id}`;
      const sourceURL = source.originWebsiteURL ||
         `${this.options.apiBaseUrl}/sources/${source._id}`;
      return `<a href="${sourceURL}">${(source.shortName || source.name)}</a>
        (<a href="${licenseURL}">${(license.shortName || license.name)}</a>)`;
    });
    if (links.length) {
      $(element).append(`<p class="ac-licenses">${t`Source`}: ${links.join(', ')}</p>`);
    }
  }

  /**
   * Calls the accessibility.cloud JSON API to get available PoIs. The PoIs are rendered as a
   * list in the given HTML element (this also accepts a jQuery selector).
   *
   * The given parameters are passed to the API's GET /place-infos endpoint.
   * More documentation is here:
   * https://github.com/sozialhelden/accessibility-cloud/blob/master/docs/json-api.md#get-place-infos
   *
   * The function returns the XHR request. You can optionally pass a callback in NodeJS-style.
   */

  // eslint-disable-next-line no-unused-vars
  loadAndRenderPlaces(element, parameters, callback = (error, results) => {}) {
    return this.getPlacesAround(parameters)
      .done((response) => {
        this.renderPlaces(element, response.features, response.related);
        this.renderSourcesAndLicenses(
          element,
          response.related.sources,
          response.related.licenses,
        );
        callback(null, response);
      })
      .fail((xhr) => {
        let message = t`Unknown error.`;
        try {
          message = JSON.parse(xhr.responseText).error.reason;
        } catch (e) {
          message = `${xhr.statusText}<br>${xhr.responseText}`;
        }
        $(element).html(`<div class="ac-error">${t`Could not load data`}:${message}</div>`);
        callback(new Error(message));
      });
  }
}
