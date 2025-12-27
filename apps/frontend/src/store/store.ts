import { configureStore } from '@reduxjs/toolkit'
import appReducer from './slices/app.slice'
import authReducer from './slices/auth.slice'

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    // Add more reducers here as needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [],
        // Ignore these field paths in all actions
        ignoredActionPaths: [],
        // Ignore these paths in the state
        ignoredPaths: [],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

