// @flow

import React from 'react';
import type { Source } from '../model/Source';
import type { License } from '../model/License';

type Props = {
  apiBaseUrl: string,
  headerText: string,
  sources: { [string]: Source },
  licenses: { [string]: License },
};

export default function Sources(props: Props) {
  return (
    <footer className="ac-licenses">
      <header>{props.headerText}</header>
      <ul>
        {Object.keys(props.sources).map((sourceId) => {
          const source = props.sources[sourceId];
          const license = props.licenses[source.licenseId];
          const licenseURL = `${this.options.apiBaseUrl}/licenses/${license._id}`;
          const sourceURL = source.originWebsiteURL ||
            `${props.apiBaseUrl}/sources/${source._id}`;
          return (<li className="ac-source">
            <a href={sourceURL}>${(source.shortName || source.name)}</a>
            <a href={licenseURL}>${(license.shortName || license.name)}</a>
          </li>);
        })}
      </ul>
    </footer>);
}
