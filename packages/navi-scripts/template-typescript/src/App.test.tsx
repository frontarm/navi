import * as Navi from 'navi';
import React from 'react';
import ReactDOM from 'react-dom';
import { NaviProvider } from 'react-navi';
import App from './App';
import routes from './routes';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const navigation = Navi.createMemoryNavigation({
    routes,
    url: '/'
  });

  ReactDOM.render(
    <NaviProvider navigation={navigation}>
      <App />
    </NaviProvider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
