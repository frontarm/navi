import * as Navi from 'navi';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import pages from './pages';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const navigation = Navi.createMemoryNavigation({
    pages,
    url: '/'
  });

  ReactDOM.render(<App navigation={navigation} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
