// eslint-disable react/jsx-filename-extension
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

ReactDOM.render(
  React.createElement(App, {
    token: '7f039b60e27a4d02b13c5ad79fbe9d7b', // <-- Replace this token with your own
    locale: 'de_DE', // <-- Replace this with the locale you want to use
    requestParameters: {
      latitude: 48.866667,
      longitude: 2.333333,
      accuracy: 10000,
      limit: 100,
    },
  }),
  document.getElementById('root'),
);
