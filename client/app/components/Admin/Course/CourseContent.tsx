import { styles } from "@/app/styles/styles";
import React, { FC, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  AiOutlineDelete,
  AiOutlinePlusCircle,
} from "react-icons/ai";
import { BiSolidBank, BiSolidPencil } from "react-icons/bi";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useSpeechOnHover } from "@/app/hooks/useSpeechOnHover";

type Props = {
  active: number;
  setActive: (active: number) => void;
  courseContentData: any;
  setCourseContentData: (courseContentData: any) => void;
  handleSubmit: any;
};

const CourseContent: FC<Props> = ({
  active,
  setActive,
  courseContentData,
  setCourseContentData,
  handleSubmit: handleCourseSubmit,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(
    Array(courseContentData.length).fill(false)
  );

  const [activeSection, setActiveSection] = useState(1);

  const addNewSectionRef = useSpeechOnHover<HTMLDivElement>("Add New Section");
  const prevButtonRef = useSpeechOnHover<HTMLDivElement>("Previous button");
  const nextButtonRef = useSpeechOnHover<HTMLDivElement>("Next button");

  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  const handleCollapseToggle = (index: number) => {
    const updatedCollapsed = [...isCollapsed];
    updatedCollapsed[index] = !updatedCollapsed[index];
    setIsCollapsed(updatedCollapsed);
  };

  const handleRemoveLink = (index: number, linkIndex: number) => {
    const updatedData = [...courseContentData];
    updatedData[index].links.splice(linkIndex, 1);
    setCourseContentData(updatedData);
  };

  const handleAddLink = (index: number) => {
    const updatedData = [...courseContentData];
    updatedData[index].links.push({ title: "", url: "" });
    setCourseContentData(updatedData);
  };

  const newContentHandler = (item: any) => {
    if (
      item.title === "" ||
      item.description === "" ||
      item.videoUrl === "" ||
      item.videoId === "" ||
      item.links[0].title === "" ||
      item.links[0].url === ""
    ) {
      toast.error("Please fill all the fields first!");
    } else {
      let newVideoSection = "";

      if (courseContentData.length > 0) {
        const lastVideoSection =
          courseContentData[courseContentData.length - 1].videoSection;

        if (lastVideoSection) {
          newVideoSection = lastVideoSection;
        }
      }
      const newContent = {
        videoId: "",
        title: "",
        description: "",
        videoSection: newVideoSection,
        videoLength: "",
        muxAssetId: "",
        links: [{ title: "", url: "" }],
        suggestion: "",
      };

      setCourseContentData([...courseContentData, newContent]);
    }
  };

  const addNewSection = () => {
    if (
      courseContentData[courseContentData.length - 1].title === "" ||
      courseContentData[courseContentData.length - 1].description === "" ||
      courseContentData[courseContentData.length - 1].videoUrl === "" ||
      courseContentData[courseContentData.length - 1].links[0].title === "" ||
      courseContentData[courseContentData.length - 1].links[0].link === ""
    ) {
      toast.error("Please fill all the fields first!");
    } else {
      setActiveSection(activeSection + 1);
      const newContent = {
        videoId: "",
        title: "",
        description: "",
        videoSection: `Untitled Section ${activeSection}`,
        videoLength: "",
        muxAssetId: "",
        links: [{ title: "", url: "" }],
        suggestion: "",
      };

      setCourseContentData([...courseContentData, newContent]);
    }
  };

  const prevButton = () => {
    setActive(active - 1);
  };

  const handleOptions = () => {
    const lastContent = courseContentData[courseContentData.length - 1];
    if (
      lastContent.title === "" ||
      lastContent.description === "" ||
      lastContent.videoUrl === "" ||
      (lastContent.links.length > 0 && lastContent.links[0].title === "") ||
      (lastContent.links.length > 0 && lastContent.links[0].url === "")
    ) {
      toast.error("Section can't be empty!");
    } else {
      setActive(active + 1);
      handleCourseSubmit();
    }
  };

  return (
    <div className="w-[80%] m-auto mt-24 p-3">
      <form onSubmit={handleSubmit}>
        {courseContentData?.map((item: any, index: number) => {
          const showSectionInput =
            index === 0 ||
            item.videoSection !== courseContentData[index - 1].videoSection;

          return (
            <CourseContentItem
                key={index}
                item={item}
                index={index}
                isCollapsed={isCollapsed}
                courseContentData={courseContentData}
                setCourseContentData={setCourseContentData}
                handleCollapseToggle={handleCollapseToggle}
                handleRemoveLink={handleRemoveLink}
                handleAddLink={handleAddLink}
                newContentHandler={newContentHandler}
                showSectionInput={showSectionInput}
            />
          );
        })}
        <br />
        <div
          ref={addNewSectionRef}
          tabIndex={0}
          className="flex items-center text-[20px] dark:text-white text-black cursor-pointer"
          onClick={() => addNewSection()}
        >
          <AiOutlinePlusCircle className="mr-2" /> Add New Section
        </div>
      </form>
      <br />
      <div className="w-full flex items-center justify-between">
        <div
          ref={prevButtonRef}
          tabIndex={0}
          className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer"
          onClick={() => prevButton()}
        >
          Prev
        </div>
        <div
          ref={nextButtonRef}
          tabIndex={0}
          className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer"
          onClick={() => handleOptions()}
        >
          Next
        </div>
      </div>
      <br />
      <br />
      <br />
    </div>
  );
};

export default CourseContent;


interface CourseContentItemProps {
    item: any;
    index: number;
    isCollapsed: boolean[];
    courseContentData: any;
    setCourseContentData: (courseContentData: any) => void;
    handleCollapseToggle: (index: number) => void;
    handleRemoveLink: (index: number, linkIndex: number) => void;
    handleAddLink: (index: number) => void;
    newContentHandler: (item: any) => void;
    showSectionInput: boolean;
}

const CourseContentItem: FC<CourseContentItemProps> = ({
    item,
    index,
    isCollapsed,
    courseContentData,
    setCourseContentData,
    handleCollapseToggle,
    handleRemoveLink,
    handleAddLink,
    newContentHandler,
    showSectionInput,
}) => {
    const sectionInputRef = useSpeechOnHover<HTMLInputElement>(`Section title input for ${item.videoSection}`);
    const pencilRef = useSpeechOnHover<SVGAElement>("Edit section title");
    const deleteContentRef = useSpeechOnHover<SVGAElement>(`Delete content ${item.title}`);
    const collapseRef = useSpeechOnHover<SVGAElement>(`Collapse content ${item.title}`);
    const videoTitleLabelRef = useSpeechOnHover<HTMLLabelElement>("Video Title");
    const videoTitleInputRef = useSpeechOnHover<HTMLInputElement>("Video Title input field");
    const muxAssetIdLabelRef = useSpeechOnHover<HTMLLabelElement>("Mux Asset ID");
    const muxAssetIdInputRef = useSpeechOnHover<HTMLInputElement>("Mux Asset ID input field");
    const videoLengthLabelRef = useSpeechOnHover<HTMLLabelElement>("Video Length (in minutes)");
    const videoLengthInputRef = useSpeechOnHover<HTMLInputElement>("Video Length input field");
    const videoDescriptionLabelRef = useSpeechOnHover<HTMLLabelElement>("Video Description");
    const videoDescriptionInputRef = useSpeechOnHover<HTMLTextAreaElement>("Video Description input field");
    const addLinkRef = useSpeechOnHover<HTMLParagraphElement>("Add Link");
    const addNewContentRef = useSpeechOnHover<HTMLParagraphElement>("Add New Content");

    return (
        <div
            className={`w-full bg-[#cdc8c817] p-4 ${
            showSectionInput ? "mt-10" : "mb-0"
            }`}
        >
            {showSectionInput && (
            <>
                <div className="flex w-full items-center">
                <input
                    ref={sectionInputRef}
                    tabIndex={0}
                    type="text"
                    className={`text-[20px] ${
                    item.videoSection === "Untitled Section"
                        ? "w-[170px]"
                        : "w-min"
                    } font-Poppins cursor-pointer dark:text-white text-black bg-transparent outline-none`}
                    value={item.videoSection}
                    onChange={(e) => {
                    const updateData = [...courseContentData];
                    updateData[index] = {
                        ...updateData[index],
                        videoSection: e.target.value,
                    };
                    setCourseContentData(updateData);
                    }}
                />
                <BiSolidPencil ref={pencilRef} tabIndex={0} className="cursor-pointer dark:text-white text-black" />
                </div>
                <br />
            </>
            )}
            <div className="flex w-full items-center justify-between my-0">
            {isCollapsed[index] ? (
                <>
                {item.title ? (
                    <p className="font-Poppins dark:text-white text-black">
                    {index + 1}. {item.title}
                    </p>
                ) : (
                    <></>
                )}
                </>
            ) : (
                <div></div>
            )}

            <div className="flex items-center">
                <AiOutlineDelete
                    ref={deleteContentRef}
                    tabIndex={0}
                    className={`dark:text-white text-[20px] mr-2 text-black ${
                    index > 0 ? "cursor-pointer" : "cursor-no-drop"
                    }`}
                    onClick={() => {
                    if (index > 0) {
                        const updatedData = [...courseContentData];
                        updatedData.splice(index, 1);
                        setCourseContentData(updatedData);
                    }
                    }}
                />
                <MdOutlineKeyboardArrowDown
                    ref={collapseRef}
                    tabIndex={0}
                    fontSize="large"
                    className="dark:text-white text-black"
                    style={{
                    transform: isCollapsed[index]
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                    onClick={() => handleCollapseToggle(index)}
                />
            </div>
            </div>
            {!isCollapsed[index] && (
            <>
                <div className="my-3">
                <label ref={videoTitleLabelRef} tabIndex={0} className={styles.label}>Video Title</label>
                <input
                    ref={videoTitleInputRef}
                    tabIndex={0}
                    type="text"
                    placeholder="Project Plan..."
                    className={`${styles.input}`}
                    value={item.title}
                    onChange={(e) => {
                    const updatedData = [...courseContentData];
                    updatedData[index] = {
                        ...updatedData[index],
                        title: e.target.value,
                    };
                    setCourseContentData(updatedData);
                    }}
                />
                </div>
                <div className="mb-3">
                <label ref={muxAssetIdLabelRef} tabIndex={0} className={styles.label}>Mux Asset ID</label>
                <input
                    ref={muxAssetIdInputRef}
                    tabIndex={0}
                    type="text"
                    placeholder="Mux Asset ID"
                    className={`${styles.input}`}
                    value={item.muxAssetId}
                    onChange={(e) => {
                    const updatedData = [...courseContentData];
                    updatedData[index] = {
                        ...updatedData[index],
                        muxAssetId: e.target.value,
                    };
                    setCourseContentData(updatedData);
                    }}
                />
                </div>
                <div className="mb-3">
                <label ref={videoLengthLabelRef} tabIndex={0} className={styles.label}>
                    Video Length (in minutes)
                </label>
                <input
                    ref={videoLengthInputRef}
                    tabIndex={0}
                    type="number"
                    placeholder="20"
                    className={`${styles.input}`}
                    value={item.videoLength}
                    onChange={(e) => {
                    const updatedData = [...courseContentData];
                    updatedData[index] = {
                        ...updatedData[index],
                        videoLength: e.target.value,
                    };
                    setCourseContentData(updatedData);
                    }}
                />
                </div>
                <div className="mb-3">
                <label ref={videoDescriptionLabelRef} tabIndex={0} className={styles.label}>Video Description</label>
                <textarea
                    ref={videoDescriptionInputRef}
                    tabIndex={0}
                    rows={8}
                    cols={30}
                    placeholder="adjflsajfd..."
                    className={`${styles.input} !h-min py-2`}
                    value={item.description}
                    onChange={(e) => {
                    const updatedData = [...courseContentData];
                    updatedData[index] = {
                        ...updatedData[index],
                        description: e.target.value,
                    };
                    setCourseContentData(updatedData);
                    }}
                />
                <br />
                </div>
                {item?.links.map((link: any, linkIndex: number) => (
                    <LinkItem
                        key={linkIndex}
                        index={index}
                        linkIndex={linkIndex}
                        link={link}
                        courseContentData={courseContentData}
                        setCourseContentData={setCourseContentData}
                        handleRemoveLink={handleRemoveLink}
                    />
                ))}
                <br />
                <div className="inline-block mb-4">
                <p
                    ref={addLinkRef}
                    tabIndex={0}
                    className="flex items-center text-[18px] dark:text-white text-black cursor-pointer"
                    onClick={() => handleAddLink(index)}
                >
                    <BiSolidBank className="mr-2" /> Add Link
                </p>
                </div>
            </>
            )}
            <br />
            {index === courseContentData.length - 1 && (
            <div>
                <p
                    ref={addNewContentRef}
                    tabIndex={0}
                    className="flex items-center text-[18px] dark:text-white text-black cursor-pointer"
                    onClick={(e: any) => newContentHandler(item)}
                >
                <AiOutlinePlusCircle className="mr-2" /> Add New Content
                </p>
            </div>
            )}
        </div>
    )
}

interface LinkItemProps {
    index: number;
    linkIndex: number;
    link: any;
    courseContentData: any;
    setCourseContentData: (courseContentData: any) => void;
    handleRemoveLink: (index: number, linkIndex: number) => void;
}

const LinkItem: FC<LinkItemProps> = ({ index, linkIndex, link, courseContentData, setCourseContentData, handleRemoveLink }) => {
    const linkTitleLabelRef = useSpeechOnHover<HTMLLabelElement>(`Link ${linkIndex + 1}`);
    const deleteLinkRef = useSpeechOnHover<SVGAElement>(`Delete link ${link.title}`);
    const linkTitleInputRef = useSpeechOnHover<HTMLInputElement>(`Link title input for ${link.title}`);
    const linkUrlInputRef = useSpeechOnHover<HTMLInputElement>(`Link url input for ${link.title}`);

    return (
        <div className="mb-2 block">
            <div className="w-full flex items-center justify-between">
                <label ref={linkTitleLabelRef} tabIndex={0} className={`${styles.label}`}>
                    Link {linkIndex + 1}
                </label>
                <AiOutlineDelete
                    ref={deleteLinkRef}
                    tabIndex={0}
                    className={`${
                    linkIndex === 0
                        ? "cursor-no-drop"
                        : "cursor-pointer"
                    } text-black dark:text-white text-[20px]`}
                    onClick={() => {
                    handleRemoveLink(index, linkIndex);
                    }}
                />
            </div>
            <input
                ref={linkTitleInputRef}
                tabIndex={0}
                type="text"
                placeholder="Source Code... (Link title)"
                className={`${styles.input}`}
                value={link.title}
                onChange={(e) => {
                const updatedData = [...courseContentData];
                updatedData[index] = {
                    ...updatedData[index],
                    links: updatedData[index].links.map(
                    (link: any, i: number) => {
                        if (i === linkIndex) {
                        return {
                            ...link,
                            title: e.target.value,
                        };
                        }
                        return link;
                    }
                    ),
                };
                setCourseContentData(updatedData);
                }}
            />
            <input
                ref={linkUrlInputRef}
                tabIndex={0}
                type="url"
                placeholder="Source Code... (Link url)"
                className={`${styles.input}`}
                value={link.url}
                onChange={(e) => {
                const updatedData = [...courseContentData];
                updatedData[index] = {
                    ...updatedData[index],
                    links: updatedData[index].links.map(
                    (link: any, i: number) => {
                        if (i === linkIndex) {
                        return {
                            ...link,
                            url: e.target.value,
                        };
                        }
                        return link;
                    }
                    ),
                };
                setCourseContentData(updatedData);
                }}
            />
        </div>
    )
}