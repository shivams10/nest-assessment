import { createSlice } from '@reduxjs/toolkit'

interface AppState {
  // Add your app-level state here
  _placeholder?: never
}

const initialState: AppState = {
  // Initialize your state here
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Add your reducers here
  },
})

// Export actions when reducers are added
// export const { } = appSlice.actions
export default appSlice.reducer

