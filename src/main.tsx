import './styles/global.css';
import React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';

import App from './app/App';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <HashRouter>
        <Switch>
          <Route component={App} />
        </Switch>
      </HashRouter>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
