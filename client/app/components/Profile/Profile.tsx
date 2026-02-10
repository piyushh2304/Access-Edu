"use client";
import React, { FC, useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import SideBarProfile from "./SideBarProfile";
import { useLogoutQuery } from "@/redux/features/auth/authApi";
import { signOut } from "next-auth/react";
import { useGetUsersAllCoursesQuery } from "@/redux/features/courses/courseApi";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import Loader from "../Loader";
import CourseCardSkeleton from "../Course/CourseCardSkeleton";
import useSpeechOnHover from "../../hooks/useSpeechOnHover";
import { useProfileVoiceCommands } from "../../hooks/useProfileVoiceCommands";
import { useSpeech } from "../../SpeechProvider";


import ProfileInfo from "./ProfileInfo";
const ChangePassword = dynamic(() => import("./ChangePassword"), {
  ssr: false,
  loading: () => <Loader />,
});
const CourseCard = dynamic(() => import("../Course/CourseCard"), {
  ssr: false,
  loading: () => <Loader />,
});

type Props = {
  user: any;
};

// Empty Courses Message Component with speech on hover
const EmptyCoursesMessage: FC = () => {
  const messageRef = useSpeechOnHover<HTMLHeadingElement>("You don't have any purchased courses");
  
  return (
    <h1 
      ref={messageRef}
      className="text-center text-[18px] font-Poppins"
    >
      You dont have any purchased courses!
    </h1>
  );
};

const Profile: FC<Props> = ({ user }) => {
  const [scroll, setScroll] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar?.url || null);
  const [logout, setLogout] = useState(false);
  const [active, setActive] = useState(1);
  const router = useRouter();
  const { data, isLoading: coursesLoading } = useGetUsersAllCoursesQuery(undefined, {
    skip: active !== 3,
  });
  const [currentUser, setCurrentUser] = useState(user);
  const [refreshUser, setRefreshUser] = useState(false);
  const { data: userData } = useLoadUserQuery(undefined, { skip: !refreshUser });
  
  // Get voice control state from SpeechProvider
  const { isVoiceControlActive } = useSpeech();

  useLogoutQuery(undefined, {
    skip: !logout,
  });

  const logoutHandler = useCallback(async () => {
    setLogout(true);
    await signOut({ redirect: false });
    router.push("/");
  }, [router]);

  // Memoize course filtering for better performance (O(n) instead of O(n*m))
  const courses = useMemo(() => {
    if (!data?.courses || !currentUser?.courses) {
      return [];
    }
    
    // Create a map for O(1) lookup instead of O(n) find
    const courseMap = new Map(
      data.courses.map((course: any) => [course._id, course])
    );
    
    // Filter courses efficiently
    return currentUser.courses
      .map((userCourse: any) => {
        const id = typeof userCourse === 'string' 
          ? userCourse 
          : userCourse?.courseId || userCourse?._id;
        return courseMap.get(id);
      })
      .filter((course: any) => course !== undefined);
  }, [data?.courses, currentUser?.courses]);

  const updateAvatar = useCallback((newAvatar: string) => {
    setAvatar(newAvatar);
  }, []);

  const updateUser = useCallback((updatedUser: any) => {
    setCurrentUser(updatedUser);
    if (updatedUser?.avatar?.url) {
      setAvatar(updatedUser.avatar.url);
    }
  }, []);

  const refreshUserData = useCallback(() => {
    setRefreshUser(true);
  }, []);

  /* logoutHandler moved up to use router */
  
  // Initialize profile voice commands (after logoutHandler is defined)
  useProfileVoiceCommands({
    isActive: isVoiceControlActive,
    setActive,
    logoutHandler,
    userRole: currentUser?.role,
    onCommandRecognized: (command) => {
      console.log('Profile command recognized:', command);
    },
  });

  // Optimize scroll handler with throttling
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScroll(window.scrollY > 85);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (userData?.user) {
      setCurrentUser(userData.user);
      if (userData.user?.avatar?.url) {
        setAvatar(userData.user.avatar.url);
      }
      setRefreshUser(false);
    }
  }, [userData]);

  return (
    <div className="w-[85%] flex mx-auto">
      <div
        className={`w-[60px] 800px:w-[310px] h-[450px] dark:bg-slate-900 bg-white bg-opacity-90 border dark:border-[#ffffff1d] border-[#00000014] rounded-[5px] shadow-sm dark:shadow-sm mt-[80px] mb-[80px] sticky ${
          scroll ? "top-[120px]" : "top-[30px]"
        } left-[30px]`}
      >
        <SideBarProfile
          user={currentUser}
          active={active}
          avatar={avatar}
          setActive={setActive}
          logoutHandler={logoutHandler}
        />
      </div>
      {active === 1 && (
        <div className="w-full h-full bg-transparent mt-[80px]">
          <ProfileInfo avatar={avatar} user={currentUser} updateAvatar={updateAvatar} updateUser={updateUser} refreshUserData={refreshUserData} />
        </div>
      )}
      {active === 2 && (
        <div className="w-full h-full bg-transparent mt-[80px]">
          <ChangePassword />
        </div>
      )}
      {active === 3 && (
        <div className="w-full pl-7 px-2 800px:px-10 mt-[80px] 800px:pl-8">
          {coursesLoading ? (
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-2 lg:gap-[25px] xl:grid-cols-3 xl:gap-[35px]">
               {[...Array(3)].map((_, i) => (
                  <CourseCardSkeleton key={i} />
               ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-2 lg:gap-[25px] xl:grid-cols-3 xl:gap-[35px]">
                {courses.map((item: any) => (
                  <CourseCard item={item} key={item._id || item.id} isProfile={true} />
                ))}
              </div>
              {courses.length === 0 && !coursesLoading && (
                <EmptyCoursesMessage />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;