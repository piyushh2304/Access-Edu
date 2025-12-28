"use client";
import CourseContent from "@/app/components/Course/CourseContent";
import Loader from "@/app/components/Loader";
import useAuth from "@/app/hooks/useAuth";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  params: any;
};

const Page = ({ params }: Props) => {
  const id = params.id;
  const [isClient, setIsClient] = React.useState(false);

  const { data: userData, isLoading, isError } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isError) {
      redirect("/");
      return;
    }
    if (userData) {
      const isPurchased = userData.user.courses?.some((item: any) => {
        const courseId = item?.courseId || item?._id || item;
        return courseId === id;
      });
      if (!isPurchased) {
        redirect("/");
      }
    }
  }, [userData, isError]);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {isLoading || !userData?.user ? (
        <Loader />
      ) : (
        <div>
          <CourseContent id={id} user={userData.user} />
        </div>
      )}
    </>
  );
};

export default Page;
