import * as $ from 'jquery';
import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';
import Svg from './svg';

export function createSvgFromTemplate(width: number, height: number) {
    const templateString = ReactDomServer.renderToString(<Svg width={width} height={height} />);
    return $(templateString);
}
