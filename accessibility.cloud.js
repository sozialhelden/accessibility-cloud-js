import Mustache from 'mustache';
import humanizeString from 'humanize-string';
import { t as translateUsingC3PO } from 'c-3po';
import { t as translateUsingGeneratedTranslations, setGlobalLocale } from './translate';

// If the `WP_LOCALE` environment variable is set, C3PO gets all strings from the source code
// in the build process.
const t = process.env.WP_LOCALE ? translateUsingC3PO : translateUsingGeneratedTranslations;

function formatName(name, properties) {
  const string = properties[`${name}Localized`] || name;
  return humanizeString(string).replace(/^Rating /, '');
}

function formatValue(value) {
  if (value === true) return t`Yes`;
  if (value === false) return t`No`;
  return value;
}

function formatRating(rating) {
  const between0and5 = Math.floor(Math.min(1, Math.max(0, rating)) * 5);
  const stars = '★★★★★'.slice(5 - between0and5);
  return `<span class="stars">${stars}</span> <span class="numeric">${between0and5}/5</span>`;
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
        if (key === 'areas' && value.length === 1) {
          return recursivelyRenderProperties(value[0]);
        }
        return `<li class="ac-group"><header class='subtle'>${name}</header> ${recursivelyRenderProperties(value)}</li>`;
      }
      if (key.startsWith('rating')) {
        return `<li class="ac-rating">${name}: ${formatRating(parseFloat(value))}</li>`;
      }
      return `<li class="ac-${typeof value}">${name}: <span class='value'>${formatValue(value)}</span></li>`;
    });

    return `<ul class="ac-group">${propertyStrings.join('')}</ul>`;
  }

  return properties;
}

function isAccessible(properties) {
  return properties.accessibility &&
    properties.accessibility.accessibleWith &&
    properties.accessibility.accessibleWith.wheelchair;
}

export default class AccessibilityCloud {
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
    const noop = () => {};
    return $.ajax({
      dataType: 'json',
      data: parameters,
      url: `${this.options.apiBaseUrl}/place-infos?includeRelated=source&locale=${this.getLocale()}`,
      headers: {
        Accept: 'application/json',
        'X-Token': this.options.token,
      },
    })
    .done(callback || noop)
    .fail(callback || noop);
  }

  resultsTemplate() {
    // eslint-disable-next-line no-multi-str
    return `<ul class="ac-result-list" role="treegrid">
      {{#places}}
        <li class="ac-result {{isAccessibleClass}}" role="gridcell" aria-expanded="false">
          <div class="ac-summary">
            <img src="${this.options.apiBaseUrl}/icons/categories/{{properties.category}}.svg"
              role="presentation"
              class="ac-result-icon">
            <div class="ac-result-distance"><a href='{{mapsHref}}'>{{{formattedDistance}}}</a></div>
            <div class="ac-result-name" role="heading">{{properties.name}}</div>
            <div class="ac-result-category">{{humanizedCategory}}</div>
            {{{infoPageLink}}}
            <div class="ac-result-accessibility-summary">{{accessibilitySummary}}</div>
            <div class="ac-result-accessibility-details ac-hidden">{{{formattedAccessibility}}}</div>
          </div>
        </li>
      {{/places}}
    </ul>`;
  }

  renderPlaces(element, places, related) {
    if (!$(element).length) {
      // console.error('Could not render results, element not found.');
      return;
    }
    const locale = this.getLocale();
    if (places && places.length) {
      $(element).html(Mustache.render(this.resultsTemplate(), {
        places,
        humanizedCategory() {
          return humanizeString(this.properties.localizedCategory || this.properties.category);
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
        isAccessibleClass() {
          return isAccessible(this.properties) ? 'is-accessible' : '';
        },
        accessibilitySummary() {
          if (isAccessible(this.properties)) {
            return t`Accessible with wheelchair`;
          }
          return t`Not accessible with wheelchair`;
        },
        infoPageLink() {
          const source = related.sources && related.sources[this.properties.sourceId];
          const sourceName = source && (source.shortName || source.name);
          if (!this.properties.infoPageUrl || !sourceName) { return ''; }
          return `<a href="${this.properties.infoPageUrl}" class="ac-result-link">${sourceName}</a>`;
        },
      }));

      // prevent slideToggle for link
      $('li.ac-result a').click(event => event.stopPropagation());

      $('li.ac-result').click(event =>
        $(event.target)
          .parent()
          .find('.ac-result-accessibility-details')
          .first()
          .slideToggle());
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
