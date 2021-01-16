import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import { App } from './App';
import * as serviceWorker from './serviceWorker';
import {store} from './_helpers';
import { StylesProvider } from '@material-ui/core';

ReactDOM.render(
    <StylesProvider injectFirst>
        <Provider store={store}>
            <App />
        </Provider>
    </StylesProvider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
