// @flow

import React from 'react';
import isPlainObject from 'lodash/isPlainObject';
import humanizeString from 'humanize-string';
import { t } from 'c-3po';


function formatName(name: string, properties: {}): string {
  const string = properties[`${name}Localized`] || humanizeString(name);
  return string.replace(/^Rating /, '');
}


function formatValue(value: mixed): string {
  if (value === true) return t`Yes`;
  if (value === false) return t`No`;
  return String(value);
}


function FormatRating({ rating }: { rating: number }) {
  const between1and5 = Math.floor(Math.min(1, Math.max(0, rating)) * 5);
  const stars = '★★★★★'.slice(5 - between1and5);
  return (<span aria-label={`${between1and5} stars`}>
    <span className="stars" aria-hidden="true">{stars}</span>
    <span className="numeric" aria-hidden="true">{between1and5}/5</span>
  </span>);
}


function DetailsArray({ array }: { array: any[] }) {
  // eslint-disable-next-line react/no-array-index-key
  const items = array.map((e, i) => <li key={i}><AccessibilityDetails details={e} /></li>);
  return <ul className="ac-list">{items}</ul>;
}


function DetailsObject({ object }: { object: {} }) {
  const properties = Object.keys(object).map((key) => {
    if (key.match(/Localized/)) { return null; }
    const value = object[key];
    const name = formatName(key, object);
    if (value && (value instanceof Array || isPlainObject(value))) {
      return [
        <dt data-key={key}>{name}</dt>,
        <dd><AccessibilityDetails details={value} /></dd>,
      ];
    }
    if (key.startsWith('rating')) {
      return [
        <dt className="ac-rating">{name}:</dt>,
        <dd><FormatRating rating={parseFloat(String(value))} /></dd>,
      ];
    }
    const className = `ac-${typeof value}`;
    const formattedValue = formatValue(value);
    // Screen readers work better when the first letter is capitalized.
    // If the attribute starts with a lowercase letter, there is no spoken pause
    // between the previous attribute value and the attribute name.
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    return [
      <dt className={className}>{capitalizedName}:</dt>,
      <dd className={className} aria-label={`${formattedValue}!`}>
        <em>{formattedValue}</em>
      </dd>,
    ];
  });
  return <dl className="ac-group" role="treeitem">{properties}</dl>;
}


type Props = {
  details: any;
};


export default function AccessibilityDetails(props: Props) {
  const details = props.details;
  if (details instanceof Array) {
    return <DetailsArray array={details} {...props} />;
  }
  if (isPlainObject(details)) {
    return <DetailsObject object={details} {...props} />;
  }
  return <div>{details}</div>;
}
