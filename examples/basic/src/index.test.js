import React from 'react';
import ReactDOM from 'react-dom';
import { Navigation } from 'react-navi';
import routes from './routes';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Navigation routes={routes} />,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
