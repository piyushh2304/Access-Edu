import { apiSlice } from "../api/apiSlice";

export const courseApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        enrollInCourse: builder.mutation({
            query: (courseId) => ({
                url: `enroll-course/${courseId}`,
                method: "PUT",
                credentials: "include" as const,
            }),
        }),
    }),
});

export const { useEnrollInCourseMutation } = courseApi;
