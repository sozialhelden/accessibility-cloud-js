import Mustache from 'mustache';
import humanizeString from 'humanize-string';
import { t as translateUsingC3PO } from 'c-3po';
import { t as translateUsingGeneratedTranslations } from './translate';

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

function isAccessible(place) {
  return place.accessibility &&
    place.accessibility.accessibleWith &&
    place.accessibility.accessibleWith.wheelchair;
}

const AccessibilityCloud = {
  getLocale() {
    return process.env.WP_LOCALE || this.locale;
  },

  apiDomain: 'https://www.accessibility.cloud',

  getPlacesAround(parameters) {
    return $.ajax({
      dataType: 'json',
      url: `${this.apiDomain}/place-infos?includeRelated=source&locale=${this.getLocale()}`,
      data: parameters,
      headers: {
        Accept: 'application/json',
        'X-Token': this.token,
      },
    });
  },

  resultsTemplate() {
    // eslint-disable-next-line no-multi-str
    return `<ul class="ac-result-list" role="treegrid"> \
      {{#places}} \
        {{#properties}} \
          <li class="ac-result {{isAccessibleClass}}" role="gridcell" aria-expanded="false"> \
            <div class="ac-summary"> \
              <img src="${this.apiDomain}/icons/categories/{{category}}.svg"
                role="presentation"
                class="ac-result-icon"> \
              <header class="ac-result-name" role="heading">{{name}}</header> \
              <div class="ac-result-distance">{{formattedDistance}}</div> \
              <div class="ac-result-category">{{humanizedCategory}}</div> \
              {{#infoPageUrl}}<a href="{{infoPageUrl}}" class="ac-result-link">{{sourceName}}</a>{{/infoPageUrl}} \
              <div class="ac-result-accessibility-summary">{{accessibilitySummary}}</div> \
              <div class="ac-result-accessibility-details ac-hidden">{{{formattedAccessibility}}}</div> \
            </div> \
          </li> \
        {{/properties}} \
      {{/places}} \
    </ul>`;
  },

  renderPlaces(element, places, related) {
    if (!$(element).length) {
      // console.error('Could not render results, element not found.');
      return;
    }
    if (places && places.length) {
      $(element).html(Mustache.render(this.resultsTemplate(), {
        places,
        humanizedCategory() {
          return humanizeString(this.localizedCategory || this.category);
        },
        formattedDistance() {
          return `${Math.round(this.distance)}m`;
        },
        formattedAccessibility() {
          return recursivelyRenderProperties(this.accessibility);
        },
        isAccessibleClass() {
          return isAccessible(this) ? 'is-accessible' : '';
        },
        accessibilitySummary() {
          if (isAccessible(this)) {
            return t`Accessible with wheelchair`;
          }
          return t`Not accessible with wheelchair`;
        },
        sourceName() {
          const source = related.sources && related.sources[this.sourceId];
          return source && (source.shortName || source.name);
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
  },

  renderSourcesAndLicenses(element, sources, licenses) {
    const links = Object.keys(sources).map((sourceId) => {
      const source = sources[sourceId];
      const license = licenses[source.licenseId];
      const licenseURL = `${this.apiDomain}/licenses/${license._id}`;
      const sourceURL = source.originWebsiteURL || `${this.apiDomain}/sources/${source._id}`;
      return `<a href="${sourceURL}">${(source.shortName || source.name)}</a>
        (<a href="${licenseURL}">${(license.shortName || license.name)}</a>)`;
    });
    if (links.length) {
      $(element).append(`<p class="ac-licenses">${t`Source`}: ${links.join(', ')}</p>`);
    }
  },

  loadAndRenderPlaces(element, parameters) {
    return this.getPlacesAround(parameters)
      .done((response) => {
        this.renderPlaces(element, response.features, response.related);
        this.renderSourcesAndLicenses(
          element,
          response.related.sources,
          response.related.licenses,
        );
      })
      .fail((error) => {
        let message = t`Unknown error.`;
        if (error) {
          try {
            message = JSON.parse(error.responseText).error.reason;
          } catch (e) {
            message = `${error.statusText}<br>${error.responseText}`;
          }
        }
        $(element).html(`<div class="ac-error">${t`Could not load data`}:${message}</div>`);
      });
  },
};

export default AccessibilityCloud;
