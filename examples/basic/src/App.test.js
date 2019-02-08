import * as Navi from 'navi';
import React from 'react';
import ReactDOM from 'react-dom';
import { NavProvider } from 'react-navi';
import App from './App';
import routes from './routes';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const navigation = Navi.createBrowserNavigation({
    routes,
    url: '/'
  });

  ReactDOM.render(
    <NavProvider navigation={navigation}>
      <App />
    </NavProvider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
