// @ts-checkz
import dotenv from 'dotenv';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import { App } from './App';
import * as serviceWorker from './serviceWorker';
import { SnackbarProvider } from 'notistack';
import {store} from './_helpers';

dotenv.config();

ReactDOM.render(
    <Provider store={store}>
        <SnackbarProvider maxSnack={1}>
            <App />
        </SnackbarProvider>
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
