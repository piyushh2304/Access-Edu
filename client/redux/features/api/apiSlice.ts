import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { userLoggedIn } from "../auth/authSlice";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_SERVER_URI,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            console.log("🔍 [DEBUG] apiSlice prepareHeaders - Token in state:", token ? "Present" : "Missing", token);
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
                console.log("✅ [DEBUG] apiSlice - Authorization header set");
            } else {
                console.warn("⚠️ [DEBUG] apiSlice - No token found in state, Authorization header NOT set");
            }
            return headers;
        },
        credentials: "include",
    }),
    tagTypes: ["User"],
    endpoints: (builder) => ({
        refreshToken: builder.query({
            query: (data) => ({
                url: "refresh"
                , method: "GET"
                , credentials: "include" as const
            })
        }),
        loadUser: builder.query({
            query: (data) => ({
                url: "me"
                , method: "GET"
                , credentials: "include" as const
            }),
            providesTags: ["User"],
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    dispatch(
                        userLoggedIn({
                            accessToken: result.data.accessToken,
                            user: result.data.user
                        })
                    )
                } catch (error: any) {
                    console.log(error)
                }
            }
        })
    })
})

export const { useRefreshTokenQuery, useLoadUserQuery } = apiSlice