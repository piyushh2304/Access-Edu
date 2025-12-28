import React, { useState, useRef } from "react";
import { BiSolidChevronDown, BiSolidChevronUp } from "react-icons/bi";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { useSpeechOnHover } from "@/app/hooks/useSpeechOnHover";

type Props = {
  data: any;
  activeVideo?: number;
  setActiveVideo?: any;
  isDemo?: boolean;
};

const ContentCourseList = (props: Props) => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set<string>()
  );

  //find unique video sections
  // const videoSections: string[] = [
  //   ...new Set<string>(props.data?.map((item: any) => item.videoSection)),
  // ];
  const videoSections: string[] = [];
  props.data?.forEach((item: any) => {
    if (item.videoSection && !videoSections.includes(item.videoSection)) {
      videoSections.push(item.videoSection);
    }
  });

  let totalCount: number = 0;

  const toggleSection = (section: string) => {
    const newVisibleSections = new Set(visibleSections);
    if (newVisibleSections.has(section)) {
      newVisibleSections.delete(section);
    } else {
      newVisibleSections.add(section);
    }
    setVisibleSections(newVisibleSections);
  };

  return (
    <div
      className={`mt-[15px] w-full ${
        !props.isDemo && "ml-[30px]  sticky top-24 left-0 z-30"
      }`}
    >
      {videoSections.map((section: string, sectionIndex: number) => {
        const isSectionVisible = visibleSections.has(section);

        // Filter video by section
        const sectionVideos: any[] = props.data.filter(
          (item: any) => item.videoSection === section
        );

        const sectionVideoCount: number = sectionVideos.length;

        const sectionVideoLength: number = sectionVideos.reduce(
          (totalLength: number, item: any) => totalLength + item.videoLength,
          0
        );

        const sectionStartIndex: number = totalCount;
        totalCount += sectionVideoCount;

        const sectionContentHours: number = sectionVideoLength / 60;

        const sectionHeadingRef = useSpeechOnHover<HTMLHeadingElement>(`Section: ${section}`);
        const toggleButtonRef = useSpeechOnHover<HTMLButtonElement>(isSectionVisible ? `Collapse ${section} section` : `Expand ${section} section`);
        const sectionSummaryRef = useSpeechOnHover<HTMLHeadingElement>(
          `${sectionVideoCount} lessons, total duration ${sectionVideoLength < 60
            ? sectionVideoLength
            : sectionContentHours.toFixed(2)} ${sectionVideoLength > 60 ? "hours" : "minutes"}`
        );

        return (
          <div
            className={`${!props.isDemo && "border-b border-[#ffffff8e] pb-2"}`}
            key={section}
          >
            <div className="w-full flex">
              {/* Render video section */}
              <div className="w-full flex justify-between dark:text-white">
                <h2 ref={sectionHeadingRef} tabIndex={0} className="text-[22px] text-black dark:text-white">
                  {section}
                </h2>
                <button
                  ref={toggleButtonRef}
                  tabIndex={0}
                  className="mr-4 cursor-pointer text-black dark:text-white"
                  onClick={() => toggleSection(section)}
                >
                  {isSectionVisible ? (
                    <BiSolidChevronUp size={20} />
                  ) : (
                    <BiSolidChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>
            <h5 ref={sectionSummaryRef} tabIndex={0} className="text-black dark:text-white">
              {sectionVideoCount} Lesson{" "}
              {sectionVideoLength < 60
                ? sectionVideoLength
                : sectionContentHours.toFixed(2)}{" "}
              {sectionVideoLength > 60 ? "hours" : "minutes"}
            </h5>
            <br />
            {isSectionVisible && (
              <div className="w-full">
                {sectionVideos.map((item: any, index: number) => {
                  const videoIndex: number = sectionStartIndex + index;
                  const contentLength: number = item.videoLength / 60;
                  const videoTitleRef = useSpeechOnHover<HTMLHeadingElement>(`Video ${index + 1}: ${item.title}`);
                  const videoLengthRef = useSpeechOnHover<HTMLHeadingElement>(
                    `Duration: ${item.videoLength > 60
                      ? contentLength.toFixed(2)
                      : item.videoLength} ${item.videoLength > 60 ? "hours" : "minutes"}`
                  );
                  return (
                    <div
                      className={`w-full ${
                        videoIndex === props.activeVideo ? "bg-slate-800" : ""
                      } cursor-pointer transition-all p-2`}
                      key={item._id}
                      onClick={() =>
                        props.isDemo ? null : props?.setActiveVideo(videoIndex)
                      }
                      tabIndex={0} // Make the whole video item focusable
                      aria-label={`Play video ${item.title}`}
                    >
                      <div className="flex items-start">
                        <div>
                          <MdOutlineOndemandVideo
                            size={25}
                            className="mr-2"
                            color="#1cdada"
                          />
                        </div>
                        <h1 ref={videoTitleRef} className="text-[18px] inline-block break-words text-black dark:text-white">
                          {item.title}
                        </h1>
                      </div>
                      <h5 ref={videoLengthRef} className="pl-8 text-black dark:text-white">
                        {item.videoLength > 60
                          ? contentLength.toFixed(2)
                          : item.videoLength}{" "}
                        {item.videoLength > 60 ? "hours" : "minutes"}
                      </h5>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <br />
    </div>
  );
};

export default ContentCourseList;
