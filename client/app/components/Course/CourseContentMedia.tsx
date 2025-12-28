import { styles } from "@/app/styles/styles";
import CoursePlayer from "@/app/utils/CoursePlayer";
import {
  useAddAnwerInQuestionMutation,
  useAddNewQuestionMutation,
  useAddReplyInReviewMutation,
  useAddReviewInCourseMutation,
  useGetCourseDetailsQuery,
} from "@/redux/features/courses/courseApi";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  AiFillStar,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineStar,
} from "react-icons/ai";
import { BiMessage } from "react-icons/bi";
import { format } from "timeago.js";

import defaultImage from "../../../public/assets/avatar.jpg";
import { VscVerifiedFilled } from "react-icons/vsc";
import Ratings from "@/app/utils/Ratings";
import socketIO from "socket.io-client";
import useSpeechOnHover from "../../hooks/useSpeechOnHover";

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

type Props = {
  data: any;
  id: string;
  activeVideo: number;
  setActiveVideo: (activeVideo: number) => void;
  user: any;
  refetch: any;
};

const CourseContentMedia = ({
  data,
  id,
  activeVideo,
  setActiveVideo,
  user,
  refetch,
}: Props) => {
  const [activeBar, setActiveBar] = useState(0);
  const [question, setQuestion] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(3);
  const [answer, setAnswer] = useState("");
  const [answerId, setAnswerId] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [isReviewReply, setIsReviewReply] = useState(false);
  const [reply, setReply] = useState("");
  const [reviewId, setReviewId] = useState("");
  const [replyActive, setReplyActive] = useState(false);
  const [
    addnewQuestion,
    { isSuccess, error, isLoading: questionCreationLoading },
  ] = useAddNewQuestionMutation();
  const [
    addAnswerInQuestion,
    {
      isSuccess: answerSuccess,
      error: answerError,
      isLoading: answerCreationLoading,
    },
  ] = useAddAnwerInQuestionMutation();
  const [
    addReviewInCourse,
    {
      isSuccess: reviewSuccess,
      error: reviewError,
      isLoading: reviewCreationLoading,
    },
  ] = useAddReviewInCourseMutation();
  const { data: courseData, refetch: courseRefetch } = useGetCourseDetailsQuery(
    id,
    { refetchOnMountOrArgChange: true }
  );
  const [
    addReplyInReview,
    {
      isSuccess: replySuccess,
      error: replyError,
      isLoading: replyCreationLoading,
    },
  ] = useAddReplyInReviewMutation();

  const course = courseData?.course;

  const isReviewExists = course?.reviews?.find(
    (item: any) => item.user._id === user._id
  );

  // Refs for TTS
  const prevLessonRef = useSpeechOnHover<HTMLDivElement>('Previous lesson button');
  const nextLessonRef = useSpeechOnHover<HTMLDivElement>('Next lesson button');
  const videoTitleRef = useSpeechOnHover<HTMLHeadingElement>(data[activeVideo]?.title || 'Video title');
  const overviewTabRef = useSpeechOnHover<HTMLHeadingElement>('Overview tab');
  const resourcesTabRef = useSpeechOnHover<HTMLHeadingElement>('Resources tab');
  const qaTabRef = useSpeechOnHover<HTMLHeadingElement>('Questions and Answers tab');
  const reviewsTabRef = useSpeechOnHover<HTMLHeadingElement>('Reviews tab');
  const descriptionRef = useSpeechOnHover<HTMLParagraphElement>(data[activeVideo]?.description || 'Course description');
  const questionInputRef = useSpeechOnHover<HTMLTextAreaElement>('Question input field');
  const submitQuestionButtonRef = useSpeechOnHover<HTMLDivElement>('Submit question button');
  const reviewInputRef = useSpeechOnHover<HTMLTextAreaElement>('Review input field');
  const submitReviewButtonRef = useSpeechOnHover<HTMLDivElement>('Submit review button');
  const addReplyReviewButtonRef = useSpeechOnHover<HTMLSpanElement>('Add reply to review button');
  const reviewReplyInputRef = useSpeechOnHover<HTMLInputElement>('Review reply input field');
  const submitReviewReplyButtonRef = useSpeechOnHover<HTMLButtonElement>('Submit review reply button');

  const handleQuestion = () => {
    if (question.length === 0) {
      toast.error("Question cant't be empty");
    } else {
      console.log({ question, courseId: id, contentId: data[activeVideo]._id });
      addnewQuestion({
        question,
        courseId: id,
        contentId: data[activeVideo]._id,
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setQuestion("");
      refetch();
      toast.success("Question added successfully");
      socketId.emit("notification", {
        title: "New Question Received",
        message: `You have a new question from ${data[activeVideo].title}`,
        userId: user._id,
      });
    }
    if (answerSuccess) {
      setAnswer("");
      refetch();
      toast.success("Answer added successfully");
      if (user.role !== "admin") {
        socketId.emit("notification", {
          title: "New Question Reply Received",
          message: `You have a new question reply in ${data[activeVideo].title}`,
          userId: user._id,
        });
      }
    }
    if (reviewSuccess) {
      setReview("");
      setRating(1);
      courseRefetch();
      toast.success("Answer added successfully");
      socketId.emit("notification", {
        title: "New Review Received",
        message: `You have a new review from ${data[activeVideo].title}`,
        userId: user._id,
      });
    }
    if (replySuccess) {
      setReply("");
      courseRefetch();
      toast.success("Reply added successfully");
    }
    if (error) {
      if ("data" in error) {
        const errorMessage = error as any;
        toast.error(errorMessage.data.message);
      }
    }
    if (replyError) {
      if ("data" in replyError) {
        const errorMessage = error as any;
        toast.error(errorMessage.data.message);
      }
    }
    if (reviewError) {
      if ("data" in reviewError) {
        const errorMessage = error as any;
        toast.error(errorMessage.data.message);
      }
    }
    if (answerError) {
      if ("data" in answerError) {
        const errorMessage = error as any;
        toast.error(errorMessage.data.message);
      }
    }
  }, [
    isSuccess,
    error,
    answerSuccess,
    answerError,
    reviewSuccess,
    reviewError,
    replySuccess,
    replyError,
  ]);

  const handleAnswerSubmit = () => {
    addAnswerInQuestion({
      answer,
      courseId: id,
      contentId: data[activeVideo]._id,
      questionId: questionId,
    });
  };

  const handleReviewSubmit = () => {
    if (review.length === 0) {
      toast.error("Review can't be empty");
    } else {
      addReviewInCourse({ review, rating, courseId: id });
    }
  };

  const handleReviewReplySubmit = () => {
    if (!replyCreationLoading) {
      if (reply === "") {
        toast.error("Reply can't be empty");
      } else {
        addReplyInReview({
          comment: reply,
          courseId: id,
          reviewId: reviewId,
        });
      }
    }
  };

  return (
    <div className="w-[95%] 800px:w-[86%] py-4 m-auto">
      <CoursePlayer
        title={data[activeVideo]?.title || "Course Video"}
        videoId={data[activeVideo]?.playbackId || data[activeVideo]?.videoId || data[activeVideo]?.muxAssetId}
        videoUrl={data[activeVideo]?.videoUrl}
        userId={user?._id || user?.id}
        videoContentId={data[activeVideo]?._id}
      />
      <div className="w-full flex items-center justify-between my-3">
        <div
          ref={prevLessonRef}
          tabIndex={0}
          className={`${
            styles.button
          } text-white !w-[unset] !min-h-[40px] !py-[unset] ${
            activeVideo === 0 && "!cursor-no-drop opacity-[.8]"
          }`}
          onClick={() =>
            setActiveVideo(activeVideo === 0 ? 0 : activeVideo - 1)
          }
        >
          <AiOutlineArrowLeft className="mr-2" />
          Prev Lesson
        </div>
        <div
          ref={nextLessonRef}
          tabIndex={0}
          className={`${
            styles.button
          } text-white !w-[unset] !min-h-[40px] !py-[unset] ${
            data.length - 1 === activeVideo && "!cursor-no-drop opacity-[.8]"
          }`}
          onClick={() =>
            setActiveVideo(
              data && data.length - 1 === activeVideo
                ? activeVideo
                : activeVideo + 1
            )
          }
        >
          Next Lesson
          <AiOutlineArrowRight className="mr-2" />
        </div>
      </div>
      <h1 ref={videoTitleRef} tabIndex={0} className="dark:text-white text-black pt-2 text-[25px] font-[600]">
        {data[activeVideo].title}
      </h1>
      <br />
      <div className="w-full p-4 flex items-center justify-between bg-slate-500 bg-opacity-20 backdrop-blur shadow-[bg-slate-700] rounded shadow-inner">
        {[
          { text: "Overview", ref: overviewTabRef },
          { text: "Recources", ref: resourcesTabRef },
          { text: "Q&A", ref: qaTabRef },
          { text: "Reviews", ref: reviewsTabRef }
        ].map((tab, index) => (
          <h5
            key={index}
            ref={tab.ref}
            tabIndex={0}
            className={`800px:text-[20px] cursor-pointer ${
              activeBar === index
                ? "text-red-500"
                : "text-black dark:text-white"
            }`}
            onClick={() => setActiveBar(index)}
          >
            {tab.text}
          </h5>
        ))}
      </div>
      <br />
      {activeBar === 0 && (
        <p ref={descriptionRef} tabIndex={0} className="text-[18px] whitespace-pre-line mb-3 dark:text-white text-black">
          {data[activeVideo]?.description}
        </p>
      )}
      {activeBar === 1 && (
        <div>
          {data[activeVideo]?.links.map((item: any, index: number) => (
            <div key={index} className="mb-5">
              <h2 tabIndex={0} className="800px:text-[20px] 800px:inline-block dark:text-white text-black">
                {item.title && item.title + " :"}
              </h2>
              <a
                href={item.url}
                tabIndex={0}
                className="inline-block text-[#4395c4] 800px:text-[20px] 800px:pl-2"
                aria-label={`Resource link titled ${item.title}, opens ${item.url}`}
              >
                {item.url}
              </a>
            </div>
          ))}
        </div>
      )}
      {activeBar === 2 && (
        <>
          <div className="flex w-full">
            <Image
              src={user.avatar ? user.avatar.url : defaultImage}
              width={50}
              height={50}
              alt="User avatar"
              className="w-[50px] h-[50px] rounded-full object-cover"
            />
            <textarea
              ref={questionInputRef}
              tabIndex={0}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              cols={40}
              rows={5}
              placeholder="Write your question..."
              name=""
              id=""
              className="outline-none bg-transparent ml-3 border dark:border-[#ffffff57] 800px:w-full p-2 rounded w-[90%] 800px:text-[18px] font-Poppins"
              aria-label="Question input field"
            ></textarea>
          </div>
          <div className="w-full flex justify-end">
            <div
              ref={submitQuestionButtonRef}
              tabIndex={0}
              className={`${
                styles.button
              } !w-[120px] !h-[40px] text-[18px] mt-5 ${
                questionCreationLoading && "cursor-not-allowed"
              }`}
              onClick={questionCreationLoading ? () => {} : handleQuestion}
            >
              Submit
            </div>
          </div>
          <br />
          <br />
          <div className="w-full h-[1px] !bg-[#9e9e9e3b]"></div>
          <div>
            <CommentReply
              data={data}
              activeVideo={activeVideo}
              answer={answer}
              setAnswer={setAnswer}
              handleAnswerSubmit={handleAnswerSubmit}
              user={user}
              setAnswerId={setAnswerId}
              questionId={questionId}
              setQuestionId={setQuestionId}
              answerCreationLoading={answerCreationLoading}
              replyActive={replyActive}
              setReplyActive={setReplyActive}
            />
          </div>
        </>
      )}
      {activeBar === 3 && (
        <>
          {!isReviewExists && (
            <>
              <div className="flex w-full">
                <Image
                  src={user.avatar ? user.avatar.url : defaultImage}
                  width={50}
                  height={50}
                  alt=""
                  className="w-[50px] h-[50px] rounded-full object-cover"
                />
                <div className="w-full">
                  <h5 tabIndex={0} className="pl-3 text-[20px] font-[500] dark:text-white text-black">
                    Give a Rating<span className="text-red-500">*</span>
                  </h5>
                  <div className="flex w-full ml-3 pb-3">
                    {[1, 2, 3, 4, 5].map((i) =>
                      rating >= i ? (
                        <AiFillStar
                          key={i}
                          tabIndex={0}
                          className="mr-1 cursor-pointer"
                          color="rgb(246, 186, 0)"
                          size={25}
                          onClick={() => setRating(i)}
                          aria-label={`${i} star rating`}
                        />
                      ) : (
                        <AiOutlineStar
                          key={i}
                          tabIndex={0}
                          className="mr-1 cursor-pointer"
                          color="rgb(246,186,0"
                          size={25}
                          onClick={() => setRating(i)}
                          aria-label={`${i} star rating`}
                        />
                      )
                    )}
                  </div>
                  <textarea
                    ref={reviewInputRef}
                    tabIndex={0}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    cols={40}
                    rows={5}
                    placeholder="Write your review..."
                    name=""
                    id=""
                    className="outline-none bg-transparent ml-3 border border-[#ffffff57] 800px:w-full p-2 rounded w-[90%] 800px:text-[18px] font-Poppins"
                    aria-label="Review input field"
                  ></textarea>
                </div>
              </div>
              <div className="w-full flex justify-end">
                <div
                  ref={submitReviewButtonRef}
                  tabIndex={0}
                  className={`${
                    styles.button
                  } !w-[120px] !h-[40px] text-[18px] mt-5 ${
                    reviewCreationLoading && "cursor-no-drop"
                  }`}
                  onClick={
                    reviewCreationLoading ? () => {} : handleReviewSubmit
                  }
                >
                  Submit
                </div>
              </div>
            </>
          )}
          <br />
          <div className="w-full h-[1px] bg-[#ffffff3b]"></div>
          <div className="w-full">
            {(course?.reviews && [...course.reviews].reverse())?.map(
              (item: any, index: number) => (
                <ReviewItem key={index} item={item} user={user} setIsReviewReply={setIsReviewReply} setReviewId={setReviewId} isReviewReply={isReviewReply} reviewId={reviewId} reply={reply} setReply={setReply} handleReviewReplySubmit={handleReviewReplySubmit} replyCreationLoading={replyCreationLoading} />
              )
            )}
          </div>
          <br />
        </>
      )}
    </div>
  );
};

interface ReviewItemProps {
  item: any;
  user: any;
  setIsReviewReply: (val: boolean) => void;
  setReviewId: (id: string) => void;
  isReviewReply: boolean;
  reviewId: string;
  reply: string;
  setReply: (val: string) => void;
  handleReviewReplySubmit: () => void;
  replyCreationLoading: boolean;
}

const ReviewItem: FC<ReviewItemProps> = ({ item, user, setIsReviewReply, setReviewId, isReviewReply, reviewId, reply, setReply, handleReviewReplySubmit, replyCreationLoading }) => {
  const reviewItemRef = useSpeechOnHover<HTMLDivElement>(`Review by ${item.user.name}. Rating: ${item.rating} stars. Comment: ${item.comment}. Reviewed ${format(item.createdAt)}.`);
  const addReplyButtonRef = useSpeechOnHover<HTMLSpanElement>('Add reply to review button');
  const replyInputRef = useSpeechOnHover<HTMLInputElement>('Reply to review input field');
  const submitReplyButtonRef = useSpeechOnHover<HTMLButtonElement>('Submit reply to review button');
  const adminVerifiedRef = useSpeechOnHover<SVGSVGElement>('Admin verified');

  return (
    <div
      ref={reviewItemRef}
      tabIndex={0}
      key={item._id}
      className="w-full my-5 dark:text-white text-black"
    >
      <div className="w-full flex">
        <div>
          <Image
            src={
              item.user.avatar ? item.user.avatar.url : defaultImage
            }
            width={50}
            height={50}
            alt={`Avatar of ${item.user.name}`}
            className="w-[50px] h-[50px] rounded-full object-cover"
          />
        </div>
        <div className="ml-2">
          <h1 className="text-[18px]">{item?.user.name}</h1>
          <Ratings rating={item.rating} />
          <p>{item.comment}</p>
          <small className="text-[#ffffff83]">
            {format(item.createdAt)}
          </small>
        </div>
      </div>
      {user.role === "admin" &&
        item.commentReplies.length === 0 && (
          <span
            ref={addReplyButtonRef}
            tabIndex={0}
            className={`${styles.label} !ml-10 cursor-pointer`}
            onClick={() => {
              setIsReviewReply(!isReviewReply),
                setReviewId(item._id);
            }}
          >
            Add Reply
          </span>
        )}
      {isReviewReply && reviewId === item._id && (
        <div className="w-full flex relative">
          <input
            ref={replyInputRef}
            tabIndex={0}
            type="text"
            placeholder="Enter your reply"
            className="block 800px:ml-12 mt-2 outline-none bg-transparent border-b border-black dark:border-[#fff] p-[5px] w-[95%]"
            value={reply}
            onChange={(e: any) => setReply(e.target.value)}
            aria-label="Reply to review input field"
          />
          <button
            ref={submitReplyButtonRef}
            tabIndex={0}
            type="submit"
            className="absolute right-0 bottom-1"
            onClick={handleReviewReplySubmit}
          >
            Submit
          </button>
        </div>
      )}
      {item.commentReplies.map((i: any, index: number) => (
        <div key={index} className="w-full flex 800px:ml-16 my-5">
          <div className="w-[50px] h-[50px]">
            <Image
              src={i.user.avatar ? i.user.avatar.url : defaultImage}
              width={50}
              height={50}
              alt={`Avatar of ${i.user.name}`}
              className="w-[50px] h-[50px] rounded-full object-cover"
            />
          </div>
          <div className="pl-2">
            <div className="flex items-center">
              <h5 tabIndex={0} className="text-[20px]">{i.user.name}</h5>{" "}
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

const CommentReply = ({
  data,
  activeVideo,
  answer,
  setAnswer,
  handleAnswerSubmit,
  user,
  setAnswerId,
  questionId,
  answerCreationLoading,
  setQuestionId,
  replyActive,
  setReplyActive,
}: any) => {
  return (
    <div className="w-full my-3">
      {data[activeVideo].questions.map((item: any, index: any) => (
        <CommentItem
          key={index}
          data={data}
          activeVide={activeVideo}
          item={item}
          index={index}
          answer={answer}
          setAnswer={setAnswer}
          questionId={questionId}
          setQuestionId={setQuestionId}
          answerCreationLoading={answerCreationLoading}
          handleAnswerSubmit={handleAnswerSubmit}
          replyActive={replyActive}
          setReplyActive={setReplyActive}
        />
      ))}
    </div>
  );
};

const CommentItem: FC<CommentItemProps> = ({
  data,
  activeVide,
  item,
  answer,
  setAnswer,
  questionId,
  setQuestionId,
  answerCreationLoading,
  handleAnswerSubmit,
  replyActive,
  setReplyActive,
}) => {
  const questionItemRef = useSpeechOnHover<HTMLDivElement>(`Question by ${item.user.name}. Question: ${item.question}. Asked ${format(item.createdAt)}.`);
  const toggleRepliesButtonRef = useSpeechOnHover<HTMLSpanElement>(
    !replyActive
      ? item.questionReplies.length !== 0
        ? "All Replies button"
        : "Add Reply button"
      : "Hide Replies button"
  );
  const messageIconRef = useSpeechOnHover<SVGSVGElement>('Message icon');
  const replyCountRef = useSpeechOnHover<HTMLSpanElement>(`${item.questionReplies.length} replies`);
  const answerInputRef = useSpeechOnHover<HTMLInputElement>('Answer input field');
  const submitAnswerButtonRef = useSpeechOnHover<HTMLButtonElement>('Submit answer button');
  const adminVerifiedRef = useSpeechOnHover<SVGSVGElement>('Admin verified');

  return (
    <div ref={questionItemRef} tabIndex={0} className="my-4">
      <div className="flex mb-2">
        <Image
          src={item.user.avatar ? item.user.avatar.url : defaultImage}
          width={50}
          height={50}
          alt={`Avatar of ${item.user.name}`}
          className="w-[50px] h-[50px] rounded-full object-cover"
        />
        <div className="pl-3 dark:text-white text-black">
          <h5 tabIndex={0} className="text-[20px]">{item.user.name}</h5>
          <p tabIndex={0}>{item.question}</p>
          <small tabIndex={0} className="text-[#000000b8] dark:text-[#ffffff83]">
            {!item.createdAt ? "" : format(item.createdAt)}
          </small>
        </div>
      </div>
      <div className="w-full flex">
        <span
          ref={toggleRepliesButtonRef}
          tabIndex={0}
          className="800px:pl-16 text-[#000000b8] dark:text-[#ffffff83] cursor-pointer mr-2"
          onClick={() => {
            setReplyActive(!replyActive), setQuestionId(item._id);
          }}
        >
          {!replyActive
            ? item.questionReplies.length !== 0
              ? "All Replies"
              : "Add Reply"
            : "Hide Replies"}
        </span>
        <BiMessage
          ref={messageIconRef}
          tabIndex={0}
          size={20}
          className="dark:text-[#ffffff83] cursor-pointer text-[#000000b8]"
        />
        <span ref={replyCountRef} tabIndex={0} className="pl-1 mt-[-4px] cursor-pointer text-[#000000b8] dark:text-[#ffffff83]">
          {item.questionReplies.length}
        </span>
      </div>
      {replyActive && questionId === item._id && (
        <>
          {item.questionReplies.map((i: any) => (
            <div
              key={i._id}
              className="w-full flex 800px:ml-16 my-5 text-black dark:text-white"
            >
              <div>
                <Image
                  src={i.user.avatar ? i.user.avatar.url : defaultImage}
                  width={50}
                  height={50}
                  alt={`Avatar of ${i.user.name}`}
                  className="w-[50px] h-[50px] rounded-full object-cover"
                />
              </div>
              <div className="pl-2">
                <div className="flex items-center">
                  <h5 tabIndex={0} className="text-[20px]">{i.user.name}</h5>{" "}
                  {i.user.role === "admin" && (
                    <VscVerifiedFilled ref={adminVerifiedRef} tabIndex={0} className="text-[#0095f6] ml-2 text-[20px]" aria-label="Admin verified" />
                  )}
                </div>
                <p tabIndex={0}>{i.answer}</p>
                <small tabIndex={0} className="text-[#ffffff83]">
                  {format(i.createdAt)}
                </small>
              </div>
            </div>
          ))}
          <>
            <div className="w-full flex relative dark:text-white text-black">
              <input
                ref={answerInputRef}
                tabIndex={0}
                placeholder="Enter your answer..."
                value={answer}
                onChange={(e: any) => setAnswer(e.target.value)}
                className={`block 800px:ml-12 outline-none bg-transparent border-b border-[#00000027] dark:text-white text-black dark:border-[#fff] p-[5px] w-[95%] ${
                  answer === "" ||
                  (answerCreationLoading && "cursor-not-allowed")
                }`}
                type="text"
                aria-label="Answer input field"
              />
              <button
                ref={submitAnswerButtonRef}
                tabIndex={0}
                type="submit"
                className="absolute right-0 bottom-1"
                onClick={handleAnswerSubmit}
                disabled={answer === "" || answerCreationLoading}
              >
                Submit
              </button>
            </div>
          </>
        </>
      )}
    </div>
  );
};

export default CourseContentMedia;
