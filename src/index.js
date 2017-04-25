import AccessibilityCloud from './accessibility.cloud';
import './accessibility.cloud.css';

function load(AccessibilityCloud) {
  const accessibilityCloud = new AccessibilityCloud({
    // apiBaseUrl: 'http://localhost:3000',
    token: '11abe59ec926dfc81926545400f9f2b5', // <-- Replace this token with your own
    locale: 'de', // <-- Replace this with the locale you want to use
  });

  const element = document.querySelector('.ac-results');

  // These parameters are passed to the JSON API's GET /place-infos endpoint.
  // More documentation is here:
  // https://github.com/sozialhelden/accessibility-cloud/blob/master/docs/json-api.md#get-place-infos
  const parameters = {
    latitude: 48.866667,
    longitude: 2.333333,
    accuracy: 10000,
    limit: 100,
  };

  accessibilityCloud.loadAndRenderPlaces(element, parameters, console.log);
}

load(AccessibilityCloud);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./accessibility.cloud.js', (modules) => {
    const newModule = require('./accessibility.cloud').default;
    console.debug('Accepting', modules, newModule);
    load(newModule);
  });
  module.hot.accept('./index.js', () => {
    window.location.reload();
  });
}