import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-navi';
import routes from './routes';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Suspense fallback={null}>
      <Router routes={routes} />
    </Suspense>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
