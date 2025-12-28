import { styles } from "@/app/styles/styles";
import { useGetHeroDataQuery } from "@/redux/features/layout/layoutApi";
import React, { useEffect, useState, useRef } from "react";
import { HiMinus, HiPlus } from "react-icons/hi";

type Props = {};

const FAQ = (props: Props) => {
  const { data } = useGetHeroDataQuery("FAQ", {});
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [questions, setQuestions] = useState<any[]>([
    {
      _id: "1",
      question: "What is AccessEdu?",
      answer: "AccessEdu is a learning management system designed to help programmers learn and grow their skills. We offer a variety of courses, from beginner to advanced, in various programming languages and technologies."
    },
    {
      _id: "2",
      question: "How do I enroll in a course?",
      answer: "To enroll in a course, simply browse our course catalog, select the course you're interested in, and click the 'Enroll Now' button. You'll be guided through the registration and payment process."
    },
    {
      _id: "3",
      question: "Are the courses self-paced?",
      answer: "Yes, all our courses are self-paced, allowing you to learn at your own convenience. You'll have lifetime access to the course materials, so you can revisit them anytime."
    },
    {
      _id: "4",
      question: "Do you offer certificates of completion?",
      answer: "Yes, upon successful completion of any course, you'll receive a certificate of completion to showcase your newly acquired skills."
    },
    {
      _id: "5",
      question: "What if I have questions during a course?",
      answer: "Each course has a dedicated Q&A section where you can ask questions and interact with instructors and fellow students. Our instructors are committed to providing timely and helpful responses."
    }
  ]);

  const mainHeadingRef = useRef<HTMLHeadingElement>(null);

  const toggleQuestion = (id: any) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };

  return (
    <div>
      <div className="w-[90%] 800px:w-[80%] m-auto">
        <h1 ref={mainHeadingRef} className={`${styles.title} 800px:text-[40px]`}>
          Frequenly Asked Questions
        </h1>
        <div className="mt-12">
          <dl className="space-y-8">
            {questions.map((q) => {
              const questionButtonRef = useRef<HTMLButtonElement>(null);
              const answerParagraphRef = useRef<HTMLParagraphElement>(null);
              return (
                <div
                  key={q._id} // Changed from q.id to q._id
                  className={`${
                    q._id !== questions[0]?._id && "border-t"
                  } border-gray-200 pt-6`}
                >
                  <dt className="text-lg">
                    <button
                      ref={questionButtonRef}
                      className="flex items-start justify-between w-full text-left focus:outline-none"
                      onClick={() => toggleQuestion(q._id)}
                      aria-expanded={activeQuestion === q._id}
                      aria-controls={`faq-panel-${q._id}`}
                    >
                      <span className="font-medium text-black dark:text-white">
                        {q.question}
                      </span>
                      <span className="ml-6 flex-shrink-0">
                        {activeQuestion === q._id ? (
                          <HiMinus className=" h-6 w-6 text-black dark:text-white" />
                        ) : (
                          <HiPlus className=" h-6 w-6 text-black dark:text-white" />
                        )}
                      </span>
                    </button>
                  </dt>
                  {activeQuestion === q._id && (
                    <dd className="mt-2 pr-12" id={`faq-panel-${q._id}`}>
                      <p ref={answerParagraphRef} className="text-base font-Poppins text-black dark:text-white">
                        {q.answer}
                      </p>
                    </dd>
                  )}
                </div>
              );
            })}
          </dl>
          <br />
          <br />
          <br />
        </div>
      </div>
    </div>
  );
};

export default FAQ;
