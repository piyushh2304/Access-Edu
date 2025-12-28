import { useGetCourseContentQuery } from "@/redux/features/courses/courseApi";
import React, { useState, useRef, useEffect } from "react";
import Loader from "../Loader";
import Heading from "@/app/utils/Heading";
import CourseContentMedia from "./CourseContentMedia";
import Header from "../Header";
import ContentCourseList from "./ContentCourseList";
import useSpeechOnHover from "@/app/hooks/useSpeechOnHover";

type Props = {
  id: string;
  user: any;
};

const CourseContent = ({ id, user }: Props) => {
  const {
    data: contentData,
    isLoading,
    refetch,
  } = useGetCourseContentQuery(id, { refetchOnMountOrArgChange: true });
  const data = contentData?.content;
  
  // Debug logging to see what data we're receiving
  useEffect(() => {
    if (data && data.length > 0) {
      console.log('Course Content Data:', data);
      data.forEach((item: any, index: number) => {
        console.log(`Video ${index + 1}:`, {
          title: item.title,
          muxAssetId: item.muxAssetId,
          playbackId: item.playbackId,
          videoId: item.videoId,
          videoUrl: item.videoUrl,
          playbackPolicy: item.playbackPolicy,
        });
      });
    }
  }, [data]);
  const [activeVideo, setActiveVideo] = useState(0);
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("Login");

  const noContentMessageRef = useSpeechOnHover<HTMLHeadingElement>('No course content available');

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Header
            activeItem={1}
            open={open}
            setOpen={setOpen}
            route={route}
            setRoute={setRoute}
          />
          <div className="w-full min-h-screen grid 800px:grid-cols-10">
            {data && data.length > 0 && data[activeVideo] ? (
              <Heading
                title={data[activeVideo]?.title}
                description="anything"
                keywords={data[activeVideo]?.tags}
              />
            ) : (
              <div className="col-span-10 flex items-center justify-center h-screen">
                <h1 ref={noContentMessageRef} tabIndex={0} className="text-2xl text-black dark:text-white">No course content available.</h1>
              </div>
            )}
            {data && data.length > 0 && (
              <div className="col-span-7">
                <CourseContentMedia
                  data={data}
                  id={id}
                  activeVideo={activeVideo}
                  setActiveVideo={setActiveVideo}
                  user={user}
                  refetch={refetch}
                />
              </div>
            )}
            {data && data.length > 0 && (
              <div className="hidden 800px:block 800px:col-span-3 ml-[-50px] pr-[50px]">
                <ContentCourseList
                  setActiveVideo={setActiveVideo}
                  data={data}
                  activeVideo={activeVideo}
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default CourseContent;
