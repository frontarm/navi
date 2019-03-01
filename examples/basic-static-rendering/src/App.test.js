import * as Navi from 'navi';
import React from 'react';
import ReactDOM from 'react-dom';
import { NaviProvider } from 'react-navi';
import App from './App';
import routes from './routes';

it('renders without crashing', async () => {
  const div = document.createElement('div');
  const navigation = Navi.createBrowserNavigation({
    routes,
    url: '/'
  });

  await navigation.steady()

  ReactDOM.render(
    <NaviProvider navigation={navigation}>
      <App />
    </NaviProvider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
