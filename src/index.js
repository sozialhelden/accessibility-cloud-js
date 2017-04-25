import App from './app';

export default class AccessibilityCloud {
  constructor(options) {
    this.options = options;
  }

  loadAndRenderPlaces(element, parameters, callback) {
    const render = (AppConstructor) => {
      new AppConstructor(this.options).loadAndRenderPlaces(element, parameters, callback);
    };

    render(App);

    // Hot Module Replacement API
    if (module.hot) {
      module.hot.accept('./app.js', () => {
        render(require('./app').default); // eslint-disable-line global-require
      });
      module.hot.accept('./index.js', () => {
        window.location.reload();
      });
    }
  }
}

window.AccessibilityCloud = AccessibilityCloud;