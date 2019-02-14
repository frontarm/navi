import * as Navi from 'navi';
import React from 'react';
import ReactDOM from 'react-dom';
import { NaviProvider, View } from 'react-navi';
import pages from './pages';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const navigation = Navi.createBrowserNavigation({ pages });

  ReactDOM.render(
    <NaviProvider navigation={navigation}>
      <View />
    </NaviProvider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
