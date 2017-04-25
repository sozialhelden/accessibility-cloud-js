# Accessibility Cloud API – JavaScript example application

This is a small and easy-to-use client-side JS library that helps with…

- fetching data from accessibility.cloud via its API
- formatting the JSON server response as HTML
- handling attribution / credits as required by licenses

Keep in mind that this library is still under development and likely to change.



## Running the example

Right now the sourcecode of the example integration resides inside the [ repository](https://github.com/sozialhelden//tree/master/public/js-example). To get it running you have to go through the following steps:

### Sign up / in

- Open https://www.accessibility.cloud
- Click *Sign up* or *Login*

### Obtain an API token

- Create an organization
- Fill out and submit the organization form and submit. You will be forwared to the organization view.
- Click "API Clients" in the header
- Click "Add API client", fill out and submit the form.
- Copy your *API access token*.

    ![api-token-view](http://i.imgur.com/SLkyvER.png)

### Run the client

- Clone or [download the repository](https://github.com/sozialhelden/accessibility-cloud-js/archive/master.zip).
- Open `dist/index.html` with your favorite text editor and replace the *API token* around line 22 with the one you copied from the API token page.
- Open `dist/index.html` in your web-browser. The result should look similar to this: ![js-api-client-example](http://i.imgur.com/kfk0cMS.png)



## Comments on the code

To balance readibility and code size, we're using the [Mustache template engine](https://github.com/janl/mustache.js) (10k) and jQuery. To not duplicate libraries on your side, how you integrate jQuery is up to you (`index.html` contains an example how). The only relevant files to use in your project are `dist/accessibility.cloud.min.js` (our JS library), `accessibility.cloud.css` (the CSS -- you can customize this to fit your own project's styling). Check `dist/index.html` for an example how to include `accessibility.cloud.js`.


### index.html

This is a very short file. Its main purpose is to execute the following script:

```html
<script>
  $(function() {
    var accessibilityCloud = new AccessibilityCloud({
      token: '7f039b60e27a4d02b13c5ad79fbe9d7b', // <-- Replace this token with your own
      locale: 'de' // <-- Replace this with the locale you want to use
    });

    var element = document.querySelector('.ac-results');

    // These parameters are passed to the JSON API's GET /place-infos endpoint.
    // More documentation is here:
    // https://github.com/sozialhelden/accessibility-cloud/blob/master/docs/json-api.md#get-place-infos
    var parameters = {
      latitude: 40.728292,
      longitude: -73.9875852,
      accuracy: 10000,
      limit: 100,
    };

    accessibilityCloud.loadAndRenderPlaces(element, parameters, console.log);
  });
</script>
```

Note that the script above includes the API token, which you have to replace with the one you get on [accessibility.cloud](https://acloud.eu.meteorapp.com) for your own API client. It also includes an example request (in this case for places in Manhattan).

The `loadAndRenderPlaces` function renders the results in the given element. It optionally accepts a callback in NodeJS `function (error, result) { … }` style.

For more information on the available parameters, refer to the [documentation on the API](https://github.com/sozialhelden//blob/master/docs/json-api.md).


### accessibility.cloud.js

This is the library's main file. It includes a few library and is built and minified using webpack.


### Building the library yourself

- [Install yarn](https://yarnpkg.com/en/docs/install)
- Set up the build toolchain with `yarn install`
- Run `yarn start` to test the functionality and start developing
- Run `yarn build` to create a minified build in the `dist/` directory
- Run `yarn version [major|minor|patch]` to create a new library version



## Translating

### Translation process

Translations are created using [transifex](https://www.transifex.com/sozialhelden/accessibility-cloud/js-widget/).

You can add translations by using [c3po](https://alexmost.gitbooks.io/c-3po-book/content/)'s `t` function in the code. The API works similar to gettext, but template string insertion and plurals are not supported (yet).

When you build a new version with `yarn build` or when you create a new version with `yarn version [major|minor|patch]`, translations are automatically synced with transifex.

### How translation syncing works internally

- Pushing translations: When building with `yarn build`, the C3PO library creates a PO template file (`dist/translations.pot`) with all found strings used as arguments to the `t` function. This file is pushed to transifex with `tx push -s dist/translations.pot`.
- Pulling translations: When all strings are translated there, you can build a new version with `yarn build`, which runs `tx pull -a`. This downloads the translations from transifex and stores them as `.po`-Files in the `src/translations/` directory. The build process extracts the strings from there and stores them in `translations.js`. This ES6 module contains all translations as JS object-structure.
