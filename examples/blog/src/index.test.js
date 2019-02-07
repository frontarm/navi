import * as Navi from 'navi';
import React from 'react';
import ReactDOM from 'react-dom';
import { NavProvider, NavContent } from 'react-navi';
import pages from './pages';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const navigation = Navi.createBrowserNavigation({ pages });

  ReactDOM.render(
    <NavProvider navigation={navigation}>
      <NavContent />
    </NavProvider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
