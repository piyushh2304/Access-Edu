import { styles } from "@/app/styles/styles";
import CoursePlayer from "@/app/utils/CoursePlayer";
import Ratings from "@/app/utils/Ratings";
import React, { FC, useRef } from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { useSpeechOnHover } from "@/app/hooks/useSpeechOnHover";

type Props = {
  active: number;
  setActive: (active: number) => void;
  courseData: any;
  handleCourseCreate: any;
  isEdit?: boolean;
};

const CoursePreview: FC<Props> = ({
  courseData,
  handleCourseCreate,
  setActive,
  active,
  isEdit,
}) => {
  const discountPercentenge =
    ((courseData?.estimatedPrice - courseData?.price) /
      courseData?.estimatedPrice) *
    100;

  const discountPercentengePrice = discountPercentenge.toFixed(0);

  const priceRef = useSpeechOnHover<HTMLHeadingElement>(`Price: ${courseData?.price === 0 ? "Free" : courseData?.price + "5"}$`);
  const estimatedPriceRef = useSpeechOnHover<HTMLHeadingElement>(`Estimated price: ${courseData?.estimatedPrice}$`);
  const discountRef = useSpeechOnHover<HTMLHeadingElement>(`${discountPercentengePrice}% Off`);
  const buyNowRef = useSpeechOnHover<HTMLDivElement>(`Buy Now for ${courseData?.price}$`);
  const discountInputRef = useSpeechOnHover<HTMLInputElement>("Discount code input field");
  const applyButtonRef = useSpeechOnHover<HTMLDivElement>("Apply discount code");
  const courseNameRef = useSpeechOnHover<HTMLHeadingElement>(`Course name: ${courseData?.name}`);
  const reviewsRef = useSpeechOnHover<HTMLHeadingElement>("0 Reviews");
  const studentsRef = useSpeechOnHover<HTMLHeadingElement>("0 Students");
  const learningTitleRef = useSpeechOnHover<HTMLHeadingElement>("What you will learn from this course?");
  const prerequisitesTitleRef = useSpeechOnHover<HTMLHeadingElement>("What are the prerequisites for starting this course?");
  const courseDetailsTitleRef = useSpeechOnHover<HTMLHeadingElement>("Course Details");
  const courseDetailsDescriptionRef = useSpeechOnHover<HTMLParagraphElement>(courseData?.description);
  const prevButtonRef = useSpeechOnHover<HTMLDivElement>("Previous button");
  const createButtonRef = useSpeechOnHover<HTMLDivElement>(isEdit ? "Update course" : "Create course");


  const prevButton = () => {
    setActive(active - 1);
  };

  const createCourse = () => {
    handleCourseCreate();
  };

  return (
    <div className="w-[80%] mt-24 py-5 m-auto mb-5">
      <div className="w-full relative">
        <CoursePlayer
          muxAssetId={courseData?.demoUrl}
          title={courseData?.title}
        />
      </div>
      <div className="flex items-center">
        <h1 ref={priceRef} tabIndex={0} className="pt-5 text-[25px]">
          {courseData?.price === 0 ? "Free" : courseData?.price + "$"}
        </h1>
        <h5 ref={estimatedPriceRef} tabIndex={0} className="pl-3 text-[20px] mt-2 line-through opacity-80">
          {courseData?.estimatedPrice}$
        </h5>

        <h4 ref={discountRef} tabIndex={0} className="pl-5 pt-4 text-[22px]">
          {discountPercentengePrice}% Off
        </h4>
      </div>

      <div className="flex items-center">
        <div
          ref={buyNowRef}
          tabIndex={0}
          className={`${styles.button} !w-[180px] my-3 font-Poppins !bg-[crimson] cursor-not-allower`}
        >
          Buy Now {courseData?.price}$
        </div>
      </div>

      <div className="flex items-center">
        <input
          ref={discountInputRef}
          tabIndex={0}
          type="text"
          name=""
          id=""
          placeholder="Discount code..."
          className={`${styles.input} 1500px:!w-[50%] 1100px:w-[60%] ml-3 !mt-0`}
        />
        <div
          ref={applyButtonRef}
          tabIndex={0}
          className={`${styles.button} !w-[120px] my-3 ml-4 font-Poppins cursor-pointer`}
        >
          Apply
        </div>
      </div>
      <p className="pb-1">* Source code included</p>
      <p className="pb-1">* Source code included</p>
      <p className="pb-1">* Source code included</p>
      <p className="pb-1 800px:pb-1">* Source code included</p>

      <div className="w-full">
        <div className="w-full 800px:pr-5">
          <h1 ref={courseNameRef} tabIndex={0} className="text-[25px] font-Poppins font-[600]">
            {courseData?.name}
          </h1>
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <Ratings rating={0} />
              <h5 ref={reviewsRef} tabIndex={0}>0 Reviews</h5>
            </div>
            <h5 ref={studentsRef} tabIndex={0}>0 Students</h5>
          </div>
          <br />
        </div>
        <h1 ref={learningTitleRef} tabIndex={0} className="text-[25px] font-Poppins font-[600]">
          What you will learn from this course?
        </h1>
        {courseData?.benefits?.map((item: any, index: number) => (
          <div className="w-full flex 800px:items-center py-2" key={index}>
            <div className="w-[15px] mr-1">
              <IoIosCheckmarkCircleOutline size={20} />
            </div>
            <p className="pl-2">{item.title}</p>
          </div>
        ))}
        <br />
        <br />
        <h1 ref={prerequisitesTitleRef} tabIndex={0} className="text-[25px] font-Poppins font-[600]">
          What are the prerequisites for starting this course?{" "}
        </h1>
        {courseData?.prerequisites?.map((item: any, index: number) => (
          <div className="w-full flex 800px:items-center py-2" key={index}>
            <div className="w-[15px] mr-1">
              <IoIosCheckmarkCircleOutline size={20} />
            </div>
            <p className="pl-2">{item.title}</p>
          </div>
        ))}
        <br />
        <br />
        <div className="w-full">
          <h1 ref={courseDetailsTitleRef} tabIndex={0} className="text-[25px] font-Poppins font-[600[">
            Course Details
          </h1>
          <p ref={courseDetailsDescriptionRef} tabIndex={0} className="text-[18px] mt-[20px] whitespace-pre-line w-full overflow-hidden">
            {courseData?.description}
          </p>
        </div>
        <br />
        <br />
      </div>
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
          ref={createButtonRef}
          tabIndex={0}
          className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer"
          onClick={() => createCourse()}
        >
          {isEdit ? "Update" : "Create"}
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;