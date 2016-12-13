import Mustache from 'mustache';
import humanizeString from 'humanize-string';

function formatName(name) {
  return name.replace(/([A-Z])/g, ' $1')
             .replace(/^./, str => str.toUpperCase())
             .replace(/^Rating /, '');
}

function formatValue(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return value;
}

function formatRating(rating) {
  const between0and5 = Math.floor(Math.min(1, Math.max(0, rating)) * 5);
  const stars = '★★★★★'.slice(5 - between0and5);
  return `<span class="stars">${stars}</span> <span class="numeric">${between0and5}/5</span>`;
}

function recursivelyRenderProperties(element) {
  if ($.isArray(element)) {
    return `<ul class="ac-list">${element.map(e => `<li>${recursivelyRenderProperties(e)}</li>`).join('')}</ul>`;
  } else if ($.isPlainObject(element)) {
    const listElements = $.map(element, (value, key) => {
      if ($.isArray(value) || $.isPlainObject(value)) {
        if (key === 'areas' && value.length === 1) {
          return recursivelyRenderProperties(value[0]);
        }
        return `<li class="ac-group"><span class='subtle'>${formatName(key)}</span> ${recursivelyRenderProperties(value)}</li>`;
      }
      if (key.startsWith('rating')) {
        return `<li class="ac-rating">${formatName(key)}: ${formatRating(parseFloat(value))}</li>`;
      }
      return `<li>${formatName(key)}: ${formatValue(value)}</li>`;
    });
    return `<ul class="ac-group">${listElements.join('')}</ul>`;
  }
  return element;
}

const AccessibilityCloud = {
  apiDomain: 'https://www.accessibility.cloud',

  getPlacesAround(parameters) {
    return $.ajax({
      dataType: 'json',
      url: `${this.apiDomain}/place-infos?includeRelated=source`,
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
        <li class="ac-result" role="gridcell" aria-expanded="false"> \
          {{#properties}} \
            <div class="ac-summary"> \
              <img src="${this.apiDomain}/icons/categories/{{category}}@2x.png" role="presentation"> \
              <header class="ac-result-name" role="heading">{{name}}</header> \
              <div class="ac-result-distance">{{formattedDistance}}</div> \
              <div class="ac-result-category">{{humanizedCategory}}</div> \
              <a href="{{infoPageUrl}}" class="ac-result-link">{{sourceName}}</a> \
              <div class="ac-result-accessibility-summary">{{accessibilitySummary}}</div> \
              <div class="ac-result-accessibility-details ac-hidden">{{{formattedAccessibility}}}</div> \
            </div> \
          {{/properties}} \
        </li> \
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
          return humanizeString(this.category);
        },
        formattedDistance() {
          return `${Math.round(this.distance)}m`;
        },
        formattedAccessibility() {
          return recursivelyRenderProperties(this.accessibility);
        },
        accessibilitySummary() {
          if (this.accessibility.accessibleWith.wheelchair) {
            return 'Accessible with wheelchair';
          }
          return 'NOT accessible with wheelchair';
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
      $(element).html('<div class="ac-no-results">No results.</div>');
    }
  },

  renderSourcesAndLicenses(element, sources, licenses) {
    const links = Object.keys(sources).map((sourceId) => {
      const source = sources[sourceId];
      const license = licenses[source.licenseId];
      const licenseURL = `${this.apiDomain}/browse/licenses/${license._id}`;
      const sourceURL = source.originWebsiteURL || `${this.apiDomain}/browse/sources/${source._id}`;
      return `<a href="${sourceURL}">${(source.shortName || source.name)}</a>
        (<a href="${licenseURL}">${(license.shortName || license.name)}</a>)`;
    });
    if (links.length) {
      $(element).append(`<p class="ac-licenses">Data: ${links.join(', ')}</p>`);
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
        let message = 'No error message';
        if (error) {
          try {
            message = JSON.parse(error.responseText).error.reason;
          } catch (e) {
            message = `${error.statusText}<br>${error.responseText}`;
          }
        }
        $(element).html(`<div class="ac-error">Could not load data:${message}</div>`);
      });
  },
};

export default AccessibilityCloud;
