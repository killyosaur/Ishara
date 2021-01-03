import {combineReducers} from 'redux';

import {alert} from './alert.reducer';
import {authentication} from './authentication.reducer';
import {registration} from './registration.reducer';
import {users} from './users.reducer';
import {posts} from './posts.reducer';

const rootReducer = combineReducers({
    authentication,
    registration,
    users,
    posts,
    alert
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
