'use client'
import { configureStore } from "@reduxjs/toolkit"
import { apiSlice } from "./features/api/apiSlice"
import authSlice from "./features/auth/authSlice"
import { courseApi } from "./features/courses/coursesApi"

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authSlice,
        [courseApi.reducerPath]: courseApi.reducer,
    },
    devTools: false,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware).concat(courseApi.middleware)
})

// call the load user funciton on every page load
const initializeApp = async () => {
    // await store.dispatch(apiSlice.endpoints.refreshToken.initiate({}, { forceRefetch: true }))
    await store.dispatch(apiSlice.endpoints.loadUser.initiate({}, { forceRefetch: true }))
}

initializeApp()