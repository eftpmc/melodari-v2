// reducers/index.js
import { combineReducers } from 'redux';
import authReducer from '../authSlice';
import playlistReducer from '../playlistSlice'; // Import the new playlists reducer

const rootReducer = combineReducers({
  auth: authReducer,
  playlists: playlistReducer, // Add the playlists reducer here
});

export default rootReducer;
