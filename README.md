# Accessibility Cloud API – JavaScript example application

This is a small and easy-to-use client-side JS library that helps with…

- fetching data from accessibility.cloud via its API
- formatting the JSON server response as HTML
- handling attribution / credits as required by licenses

Keep in mind that this library is still under development and likely to change.


## Running the example

Right now the sourcecode of the example integration resides inside the [ repository](https://github.com/sozialhelden//tree/master/public/js-example). To get it running you have to go through the following steps:

### Sign up / in

1. Open https://www.accessibility.cloud
2. Click *Sign up* or *Login*

### Obtain an API token

3. Create an organization

4. Fill out and submit the organization form and submit. You will be forwared to the organization view.

5. Click "API Clients" in the header

6. Click "Add API client", fill out and submit the form.

7. Copy your *API access token*.

    ![api-token-view](http://i.imgur.com/SLkyvER.png)

### Run the client

8. Clone or [download the repository](https://github.com/sozialhelden/accessibility-cloud-js/archive/master.zip).
9. Open `index.html` with your favorite text editor and replace the *API token* around line 22 with the one you copied from the API token page.
10. Open index.html in your web-browser. The result should look similar to this: ![js-api-client-example](http://i.imgur.com/kfk0cMS.png)


## Comments on the code

To balance readibility and code size, we're using the [Mustache template engine](https://github.com/janl/mustache.js) (10k) and jQuery. To not duplicate libraries on your side, how you integrate jQuery is up to you (`index.html` contains an example how). The only relevant files to use in your project are `dist/accessibility.cloud.min.js` (our JS library), `accessibility.cloud.css` (the CSS -- it's up to you to customize it to fit your own project's styling). Check `dist/index.html` for an example how to include accessibility.cloud.js.

### index.html

This is a very short file. Its main purpose is to execute the following script:

```html
    <script>
      $(function() {
        AccessibilityCloud.token = 'd48f457365247932472939ddff7aa'; // <-- Replace this token with your own
        var element = document.querySelector('.ac-results');
        var parameters = { latitude: 40.728292, longitude: -73.9875852, accuracy: 10000, limit: 100 };
        AccessibilityCloud.loadAndRenderPlaces(element, parameters);
      });
    </script>
```

Note that it includes the API token, which you have to replace with the one you get on [accessibility.cloud](https://acloud.eu.meteorapp.com) for your own API client. It also includes an example request (in this case for places in Manhattan). For more information on the available parameters, refer to the [documentation on the API](https://github.com/sozialhelden//blob/master/docs/json-api.md).

### accessibility.cloud.js

This is the library's main file. It includes a few library and is built and minified using webpack.

### Building the library yourself

- Set up the build toolchain with `npm install`
- Run `npm run build` to create a minified build in the `dist/` directory
- Open `dist/index.html` to test the functionality
- Run `npm version [major|minor|patch]` to create a new library version
