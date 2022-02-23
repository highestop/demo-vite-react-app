import './styles/global.css';
import React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';

import App from './app/App';

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Route element={App} />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
