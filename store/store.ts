import {
  configureStore,
  combineReducers,
  isRejectedWithValue,
  Middleware,
} from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer, { clearUser } from './slices/authSlice';
import teamsReducer from './slices/teamsSlice';
import projectsReducer from './slices/projectsSlice';
import dashboardReducer from './slices/dashboardSlice';

// Middleware to handle 401 errors and auto logout
const authErrorMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload as { message?: string; status?: number };
    if (payload?.status === 401 || payload?.message === 'Unauthorized') {
      // Clear user and redirect to login
      storeAPI.dispatch(clearUser());
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
  return next(action);
};

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  teams: teamsReducer,
  projects: projectsReducer,
  dashboard: dashboardReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(authErrorMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
