import { createStore, combineReducers } from 'redux';

import { home } from './home-store';
import { login } from './login-store';

const reducers = combineReducers({
    home,
    login
});

const store = createStore(reducers,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export default store;