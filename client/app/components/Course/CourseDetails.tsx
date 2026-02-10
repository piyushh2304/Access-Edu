import { styles } from "@/app/styles/styles";
import CoursePlayer from "@/app/utils/CoursePlayer";
import Ratings from "@/app/utils/Ratings";
import Link from "next/link";
import { format } from "timeago.js";
import React, { useEffect, useState, FC } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io"; // Removed IoMdCloseCircleOutline since modal is gone
import ContentCourseList from "./ContentCourseList";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useEnrollInCourseMutation } from "@/redux/features/courses/coursesApi";
import Image from "next/image";
import { VscVerifiedFilled } from "react-icons/vsc";
import defaultImage from "@/public/assets/avatar.jpg";
import useAuth from "@/app/hooks/useAuth";
import { useSpeechOnHover } from "../../hooks/useSpeechOnHover";
// Removed Stripe imports and CheckOutForm

type Props = {
  data: any;
  setRoute: any;
  setOpen: any;
};

const CourseDetails = ({
  data,
  setRoute,
  setOpen: openAuthModal,
}: Props) => {
  const { data: userData, refetch } = useAuth(); // Get refetch from useAuth
  const router = useRouter();

  // Calculate discount percentage before using it in hooks
  const discountprecentange =
    data?.estimatedPrice && data?.price
      ? ((data.estimatedPrice - data.price) / data.estimatedPrice) * 100
      : 0;

  const discountPercentengePrice = discountprecentange.toFixed(0);

  const courseNameRef = useSpeechOnHover<HTMLHeadingElement>(data?.name || 'Course name');
  const reviewsCountRef = useSpeechOnHover<HTMLHeadingElement>(`${data.reviews?.length || 0} reviews`);
  const studentsCountRef = useSpeechOnHover<HTMLHeadingElement>(`${data.purchased || 0} students`);
  const whatYouWillLearnHeadingRef = useSpeechOnHover<HTMLHeadingElement>('What you will learn from this course heading');
  const prerequisitesHeadingRef = useSpeechOnHover<HTMLHeadingElement>('What are the prerequisites for starting this course heading');
  const courseOverviewHeadingRef = useSpeechOnHover<HTMLHeadingElement>('Course Overview heading');
  const courseDetailsHeadingRef = useSpeechOnHover<HTMLHeadingElement>('Course Details heading');
  const courseDescriptionRef = useSpeechOnHover<HTMLParagraphElement>(data.description || 'Course description');
  const courseRatingSummaryRef = useSpeechOnHover<HTMLHeadingElement>(
    `${Number.isInteger(data?.ratings) ? data?.ratings.toFixed(1) : data?.ratings?.toFixed(2) || '0'} Course Rating. ${data?.reviews?.length || 0} Reviews.`
  );
  const priceRef = useSpeechOnHover<HTMLHeadingElement>(data.price === 0 ? "Free" : `Price: ${data.price}$`);
  const discountRef = useSpeechOnHover<HTMLHeadingElement>(`${discountPercentengePrice}% Off`);
  const enterCourseButtonRef = useSpeechOnHover<HTMLAnchorElement>('Enter to Course button');
  const enrollNowButtonRef = useSpeechOnHover<HTMLDivElement>('Enroll now button');
  const sourceDoc1Ref = useSpeechOnHover<HTMLParagraphElement>('Source document included');
  const sourceDoc2Ref = useSpeechOnHover<HTMLParagraphElement>('Source document included');
  const sourceDoc3Ref = useSpeechOnHover<HTMLParagraphElement>('Source document included');
  const sourceDoc4Ref = useSpeechOnHover<HTMLParagraphElement>('Source document included');

  const isPurchased =
    userData?.user && userData?.user?.courses?.find((item: any) => (item._id || item.courseId) === data._id); // Use userData.user directly

  const [enrollInCourse, { data: enrollData, error }] =
    useEnrollInCourseMutation();

  const handleEnroll = (e: any) => {
    if (userData?.user) {
      enrollInCourse(data._id);
    } else {
      setRoute("Login");
      openAuthModal(true);
    }
  };

  useEffect(() => {
    if (enrollData) {
      refetch();
      toast.success("Enrolled successfully");
      router.push(`/course-access/${data._id}`);
    }
    if (error) {
      if ("data" in error) {
        const errorMessage = error as any;
        toast.error(errorMessage.data.message);
      }
    }
  }, [enrollData, error]);

  return (
    <div>
      <div className="w-[90%] 800px:w-[90%] m-auto py-5">
        <div className="w-full flex flex-col-reverce 800px:flex-row">
          <div className="w-full 800px:w-[65%] 800px:pr-[50px]">
            <h1 ref={courseNameRef} tabIndex={0} className="text-[25px] font-Poppins font-[600] text-black dark:text-white">
              {data?.name}
            </h1>
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center">
                <Ratings rating={data.ratings} />
                <h5 ref={reviewsCountRef} tabIndex={0} className="text-black dark:text-white">
                  {data.reviews?.length} Reviews
                </h5>
              </div>
              <h5 ref={studentsCountRef} tabIndex={0} className="text-black dark:text-white">
                {data.purchased} Students
              </h5>
            </div>

            <br />
            <h1 ref={whatYouWillLearnHeadingRef} tabIndex={0} className="text-[25px] font-Poppins font-[600] text-black dark:text-white">
              What you will learn form this course?
            </h1>
            <div>
              {data.benefits?.map((item: any, index: number) => (
                <div
                  className="w-full flex 800px:items-center py-2"
                  key={index}
                  tabIndex={0}
                  aria-label={`Benefit ${index + 1}: ${item.title}`}
                >
                  <div className="w-[15px] mr-1">
                    <IoMdCheckmarkCircleOutline
                      size={20}
                      className="text-black dark:text-white"
                    />
                  </div>
                  <p className="pl-2 text-black dark:text-white">
                    {item.title}
                  </p>
                </div>
              ))}
              <br />
              <br />
            </div>
            <h1 ref={prerequisitesHeadingRef} tabIndex={0} className="text-[25px] font-Poppins font-[600] text-black dark:text-white">
              What are the prerequisites for starting this course?
            </h1>
            <div>
              {data.prerequisites?.map((item: any, index: number) => (
                <div
                  className="w-full flex 800px:items-center py-2"
                  key={index}
                  tabIndex={0}
                  aria-label={`Prerequisite ${index + 1}: ${item.title}`}
                >
                  <div className="w-[15px] mr-1">
                    <IoMdCheckmarkCircleOutline
                      size={20}
                      className="text-black dark:text-white"
                    />
                  </div>
                  <p className="pl-2 text-black dark:text-white">
                    {item.title}
                  </p>
                </div>
              ))}
              <br />
              <br />
            </div>
            <div>
              <h1 ref={courseOverviewHeadingRef} tabIndex={0} className="text-[25px] font-Poppins font-[600] text-black dark:text-white">
                Course Overview
              </h1>
              <ContentCourseList data={data?.courseData} isDemo={true} />
              <div className="w-full">
                <h1 ref={courseDetailsHeadingRef} tabIndex={0} className="text-[25px] font-Poppins font-[600] text-black dark:text-white">
                  Course Details
                </h1>
                <p ref={courseDescriptionRef} tabIndex={0} className="text-[18px] mt-[20px] whitespace-pre-line w-full overflow-hidden text-black dark:text-white">
                  {data.description}
                </p>
              </div>
              <br />
              <br />
              <div className="w-full">
                <div className="800px:flex items-center">
                  <Ratings rating={data?.ratings} />
                  <div className="mb-2 800px:mb-[unset]">
                    <h5 ref={courseRatingSummaryRef} tabIndex={0} className="text-[25px] font-Poppins text-black dark:text-white">
                      {Number.isInteger(data?.ratings)
                        ? data?.ratings.toFixed(1)
                        : data?.ratings.toFixed(2)}{" "}
                      Course Rating * {data?.reviews?.length} Reviews
                    </h5>
                  </div>
                </div>
                <br />
                {(data?.reviews && [...data.reviews].reverse()).map(
                  (item: any, index: number) => (
                    <ReviewItem key={index} item={item} />
                  )
                )}
              </div>
            </div>
          </div>
          <div className="w-full 800px:w-[35%] relative">
            <div className="sticky top-[100px] left-0 z-50 w-full">
              <CoursePlayer videoUrl={data?.demoUrl} title={data?.title} />
              <div className="flex items-center">
                <h1 ref={priceRef} tabIndex={0} className="pl-5 text-[25px] text-black dark:text-white">
                  {data.price === 0 ? "Free" : data.price + "$"}
                </h1>
                <h5 ref={discountRef} tabIndex={0} className="pl-5 pt-4 text-[22px] text-black dark:text-white">
                  {discountPercentengePrice}% Off
                </h5>
              </div>
              <div className="flex items-center">
                {isPurchased ? (
                  <Link
                    ref={enterCourseButtonRef}
                    tabIndex={0}
                    className={`${styles.button} !w-[180px] my-3 font-Poppins cursor-pointer !bg-[crimson]`}
                    href={`/course-access/${data._id}`}
                  >
                    Enter to Course
                  </Link>
                ) : (
                  <div
                    ref={enrollNowButtonRef}
                    tabIndex={0}
                    className={`${styles.button} !w-[180px] my-3 font-Poppins cursor-pointer !bg-[#CC3333]`}
                    onClick={handleEnroll}
                  >
                    Enroll Now
                  </div>
                )}
              </div>
              <br />
              <p ref={sourceDoc1Ref} tabIndex={0} className="pb-1 text-black dark:text-white">
                * Source doce included
              </p>
              <p ref={sourceDoc2Ref} tabIndex={0} className="pb-1 text-black dark:text-white">
                * Source doce included
              </p>
              <p ref={sourceDoc3Ref} tabIndex={0} className="pb-1 text-black dark:text-white">
                * Source doce included
              </p>
              <p ref={sourceDoc4Ref} tabIndex={0} className="pb-1 800px:pb-1 text-black dark:text-white">
                * Source doce included
              </p>
            </div>
          </div>
        </div>
      </div>
      <>
      </>
    </div>
  );
};

interface ReviewItemProps {
  item: any;
}

const ReviewItem: FC<ReviewItemProps> = ({ item }) => {
  const reviewItemRef = useSpeechOnHover<HTMLDivElement>(`Review by ${item.user.name}. Rating: ${item.rating} stars. Comment: ${item.comment}. Reviewed ${format(item.createdAt)}.`);
  const adminVerifiedRef = useSpeechOnHover<SVGSVGElement>('Admin verified');

  return (
    <div ref={reviewItemRef} tabIndex={0} className="w-full pb-4">
      <div className="flex">
        <div className="w-[50px] h-[50px]">
          <Image
            src={
              item.user.avatar
                ? item.user.avatar.url
                : defaultImage
            }
            width={50}
            height={50}
            alt={`Avatar of ${item.user.name}`}
            className="w-[50px] h-[50px] rounded-full object-cover"
          />
        </div>
        <div className="hidden 800px:block pl-2">
          <div className="flex items-center">
            <h5 tabIndex={0} className="text-[18px] pr-2 text-black dark:text-white">
              {item.user.name}
            </h5>
            <Ratings rating={item.rating} />
          </div>
          <p tabIndex={0} className="text-black dark:text-white">
            {item.comment}
          </p>
          <small tabIndex={0} className="text-[#000000d1] dark:text-[#ffffff83]">
            {format(item.createdAt)}
          </small>
        </div>
        <div className="pl-2 flex 800px:hidden items-center">
          <h5 tabIndex={0} className="text-[18px] pr-2 text-black dark:text-white">
            <Ratings rating={item.rating} />
          </h5>
        </div>
      </div>
      {item.commentReplies.map((i: any, index: number) => (
        <div
          className="w-full flex 800px:ml-16 my-5"
          key={index}
        >
          <div className="w-[50px] h-[50px]">
            <Image
              src={
                i.user.avatar ? i.user.avatar.url : defaultImage
              }
              width={50}
              height={50}
              alt={`Avatar of ${i.user.name}`}
              className="w-[50px] h-[50px] rounded-full object-cover"
            />
          </div>
          <div className="pl-2">
            <div className="flex items-center">
              <h5 tabIndex={0} className="text-[20px]">{i.user.name}</h5>
              {i.user.role === "admin" && (
                <VscVerifiedFilled ref={adminVerifiedRef} tabIndex={0} className="text-[#0095f6] ml-2 text-[20px]" aria-label="Admin verified" />
              )}
            </div>
            <p tabIndex={0}>{i.comment}</p>
            <small tabIndex={0} className="text-[#ffffff83]">
              {format(i.createdAt)}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseDetails;