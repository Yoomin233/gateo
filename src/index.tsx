import 'react-hot-loader';
import * as React from 'react';

import { hot } from 'react-hot-loader/root';
import { AppContainer } from 'react-hot-loader';

// polyfill

import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as ReactDOM from 'react-dom';
// import { AppContainer } from 'react-hot-loader';

import App from './App';
import './styles/style.less';

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  );
};

render(hot(App));
