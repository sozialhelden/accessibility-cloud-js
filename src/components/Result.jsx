// @flow
/* eslint jsx-a11y/no-static-element-interactions: 0 */

import React, { Component } from 'react';
import { t } from 'c-3po';
import get from 'lodash/get';
import set from 'lodash/set';
import isArray from 'lodash/isArray';
import cloneDeep from 'lodash/cloneDeep';
import isPlainObject from 'lodash/isPlainObject';
import humanizeString from 'humanize-string';

import AccessibilityDetails from './AccessibilityDetails';
import InfoPageLink from './InfoPageLink';
import Distance from './Distance';
import type { PlaceInfo, PlaceInfoRelated, PlaceInfoProperties } from '../model/PlaceInfo';
import PlaceIcon from './PlaceIcon';
import ExtraInfo from './ExtraInfo';
import InfoIcon from './InfoIcon';


function humanizedCategory(properties: PlaceInfoProperties): ?string {
  if (!properties) { return null; }
  return properties.localizedCategory || humanizeString(properties.category);
}


function isAccessible(properties: PlaceInfoProperties): boolean {
  return Boolean(get(properties, 'accessibility.accessibleWith.wheelchair'));
}


function isPartiallyAccessible(properties: PlaceInfoProperties): boolean {
  return Boolean(get(properties, 'accessibility.isPartiallyAccessible.wheelchair'));
}


function accessibilitySummary(properties: PlaceInfoProperties) {
  if (isAccessible(properties)) { return t`Accessible with wheelchair`; }
  if (isPartiallyAccessible(properties)) { return t`Partially accessible with wheelchair`; }
  return t`Not accessible with wheelchair`;
}

function isDefined(x): boolean {
  return typeof x !== 'undefined' &&
    x !== null &&
    !(isArray(x) && x.length === 0) &&
    !(isPlainObject(x) && Object.keys(x).length === 0);
}

function removeNullAndUndefinedFields(something: ?any): ?any {
  if (isPlainObject(something)) {
    const result = {};
    Object.keys(something)
      .filter(key => isDefined(something[key]) && !key.match(/Localized$/))
      .forEach((key) => {
        const value = removeNullAndUndefinedFields(something[key]);
        if (isDefined(value)) {
          result[key] = value;
        }
      });
    return Object.keys(result).length > 0 ? result : undefined;
  } else if (isArray(something)) {
    const result = something
      .filter(isDefined)
      .map(removeNullAndUndefinedFields);
    return result.length ? result : undefined; // filter out empty arrays
  }
  return something;
}


function hasAdditionalAccessibilityProperties(properties: PlaceInfoProperties): boolean {
  const clonedProperties = cloneDeep(properties);
  set(clonedProperties, 'accessibility.accessibleWith.wheelchair', null);
  set(clonedProperties, 'accessibility.partiallyAccessibleWith.wheelchair', null);
  const propertiesAfterRemoval = removeNullAndUndefinedFields(clonedProperties);
  return Boolean(propertiesAfterRemoval && propertiesAfterRemoval.accessibility);
}


type State = {
  isExpanded: boolean;
};


type Props = {
  related: PlaceInfoRelated,
  apiBaseUrl: string,
  locale: string,
  placeInfo: PlaceInfo,
};


export default class Result extends Component<*, Props, State> {
  constructor(props: Props) { // eslint-disable-line no-useless-constructor
    super(props);
  }

  state = { isExpanded: false };
  element: HTMLElement;

  toggle() {
    this.setState({ isExpanded: !this.state.isExpanded });
    this.element.focus();
  }

  collapse() { this.setState({ isExpanded: false }); }

  expand() { this.setState({ isExpanded: true }); }

  selectPreviousElement() {
    if (this.element.previousElementSibling) {
      this.element.previousElementSibling.focus();
    }
  }

  selectNextElement() {
    if (this.element.nextElementSibling) {
      this.element.nextElementSibling.focus();
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    // debugger;
    switch (event.keyCode) {
      case 13:
        this.toggle();
        event.preventDefault();
        break;
      case 38: // up
        this.selectPreviousElement();
        break;
      case 40: // down
        this.selectNextElement();
        break;
      case 37: // left
        this.collapse();
        break;
      case 39: // right
        this.expand();
        break;
      default: break;
    }
  }

  render() {
    const placeInfo = this.props.placeInfo;
    const properties = placeInfo.properties;
    const related = this.props.related;

    const classNames = {
      'ac-result': true,
      'is-accessible': isAccessible(properties),
    };
    const classNamesString = Object.keys(classNames)
      .filter(name => classNames[name])
      .join(' ');

    const id = `ac-details-${placeInfo.properties._id}`;
    const locale = this.props.locale;


    const hasDetails = hasAdditionalAccessibilityProperties(properties);

    const detailsOrNothing = hasDetails ? (<div
      className="ac-details"
      aria-hidden={!this.state.isExpanded}

    >
      <ExtraInfo locale={locale} related={related} sourceId={properties.sourceId} />
      <AccessibilityDetails details={properties.accessibility} role="tree" />
    </div>) : null;

    const infoIconOrNothing = hasDetails ? <InfoIcon role="presentation" /> : null;
    const categoryName = humanizedCategory(properties);
    return (<button
      className={classNamesString}
      aria-controls={hasDetails ? id : null}
      aria-expanded={hasDetails ? this.state.isExpanded : null}
      onClick={hasDetails ? event => this.toggle(event) : null}
      onBlur={event => this.collapse(event)}
      onKeyDown={event => this.handleKeyDown(event)}
      role="listitem"
      tabIndex="0"
      id={id}
      ref={(e) => { this.element = e; }}
    >
      <PlaceIcon category={properties.category || 'undefined'} apiBaseUrl={this.props.apiBaseUrl} />
      <header className="ac-result-name" role="heading">{properties.name}</header>
      <InfoPageLink related={related} properties={properties} />
      <section className="ac-result-category" aria-label={categoryName}>{categoryName}</section>
      <Distance locale={locale} distance={properties.distance} geometry={placeInfo.geometry} />
      <div className="ac-summary">{accessibilitySummary(properties)}{infoIconOrNothing}</div>
      {detailsOrNothing}
    </button>);
  }
}
