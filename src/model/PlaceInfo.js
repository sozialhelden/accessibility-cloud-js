// @flow

import type { GeometryObject } from 'geojson-flow';
import type { Accessibility } from './Accessibility';
import type { License } from './License';
import type { Source } from './Source';

export type PlaceInfoProperties = {
  _id: string,
  accessibility: Accessibility,
  category?: string,
  distance?: number,
  infoPageUrl?: string,
  localizedCategory?: string,
  name?: string,
  originalData: {},
  originalId: string,
  sourceId: string,
  sourceImportId: string,
};

export type PlaceInfo = {
  type: 'Feature',
  geometry: ?GeometryObject,
  properties: PlaceInfoProperties,
};

export type PlaceInfoRelated = {
  sources: { [string]: Source[] },
  licenses: { [string]: License[] },
};

export type PlaceInfoCollection = {
  type: 'FeatureCollection',
  features: PlaceInfo[],
  related: PlaceInfoRelated,
};
