## Root Cause
- Backend stores `user.courses` as ObjectIds, but schema expects `{ courseId: string }` objects (`server/models/user.model.ts:56–60`).
- Eligibility checks use mismatched shapes:
  - Backend: `getCourseByUser` looks for `course.courseId === courseId` (`server/controllers/course.controller.ts:168–175`).
  - Backend: `addReview` checks `course._id` (`server/controllers/course.controller.ts:391–399`).
  - Frontend: course-access gate checks `item._id === id` (`client/app/course-access/[id]/page.tsx:22–33`).
- Result: enrolled users fail the eligibility check, `get-course-content/:id` returns an error, and UI falls back to “No course content available.” (`client/app/components/Course/CourseContent.tsx:47`).
- Secondary issue: video player prop mismatch — `CoursePlayer` expects `muxAssetId`, call site passes `videoId` (`client/app/utils/CoursePlayer.tsx:3–8` vs `client/app/components/Course/CourseContentMedia.tsx:216–219`).

## Backend Changes
- Normalize enrollment write:
  - Change `enrollInCourse` to push `{ courseId: courseId }` instead of raw ObjectId (`server/controllers/course.controller.ts:221`).
- Make eligibility checks robust (handle both legacy ObjectId arrays and `{ courseId }` objects):
  - In `getCourseByUser`, replace the `find` with a `some` that matches either shape:
    - `(c: any) => (c.courseId || c.toString()) === courseId` (`server/controllers/course.controller.ts:168–175`).
  - In `addReview`, use the same robust shape check:
    - `(c: any) => (c.courseId || c._id?.toString?.() || c.toString()) === courseId` (`server/controllers/course.controller.ts:391–399`).
- Optional data migration (for consistency): run a one-off script to transform existing users’ `courses` entries from ObjectIds to `{ courseId }` objects.

## Frontend Changes
- Align purchase gate with backend data:
  - Update `client/app/course-access/[id]/page.tsx` to accept both shapes:
    - `item.courseId === id || item._id === id || item === id` (`client/app/course-access/[id]/page.tsx:22–33`).
- Fix video player prop mismatch:
  - Option A (minimal change): update `CoursePlayer` to accept `videoId` and use it for the Mux URL (`client/app/utils/CoursePlayer.tsx:3–8, 16`).
  - Option B (alternative): keep `CoursePlayer` props as `muxAssetId` and change the call site to pass `muxAssetId={data[activeVideo]?.muxAssetId}` (`client/app/components/Course/CourseContentMedia.tsx:216–219`).
- Optional UX: handle `isError` in `CourseContent` and display a clearer message when access is denied (`client/app/components/Course/CourseContent.tsx:25–59`).

## Verification
- Enroll a test user in a course; confirm `user.courses` contains `{ courseId: "<id>" }`.
- Access `/course-access/[id]`:
  - Gate allows entry for enrolled users.
  - `useGetCourseContentQuery` returns lesson data; the heading renders and the content list populates.
  - Video plays via Mux with the corrected prop.
- Regression checks:
  - Add question/answer/review flows continue to work.
  - Existing users with legacy data can still access courses (robust eligibility checks).

## Rollout Notes
- Apply backend changes first, then frontend.
- If many users have legacy enrollments, consider the optional migration to standardize data.
- No secrets or environment changes required; cookies are already sent via `credentials: "include"` (`client/redux/features/courses/courseApi.ts:50–55`).