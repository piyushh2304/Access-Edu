import React, { useEffect, useRef } from "react";
import { styles } from "../styles/styles";
type Props = {};

const About = (props: Props) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraph1Ref = useRef<HTMLParagraphElement>(null);
  const founderNameRef = useRef<HTMLSpanElement>(null);
  const founderTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (paragraph1Ref.current) {
      paragraph1Ref.current.setAttribute('tabIndex', '0');
      paragraph1Ref.current.setAttribute('aria-label', paragraph1Ref.current.textContent || '');
    }
    if (founderTitleRef.current) {
      founderTitleRef.current.setAttribute('tabIndex', '0');
      founderTitleRef.current.setAttribute('aria-label', founderTitleRef.current.textContent || '');
    }
  }, []);

  return (
    <div className="text-black dark:text-white">
      <br />
      <h1 ref={headingRef} tabIndex={0} className={`${styles.title} 800px:!text-[45px]`}>
        What is <span className="text-gradient">AccessEdu</span>
      </h1>
      <br />
      <div className="w-[95%] 800px:w-[85%] m-auto">
    <p ref={paragraph1Ref} className="text-[18px] font-Poppins">
  AccessEdu is an inclusive e-learning platform designed to make quality
  education accessible for everyone, especially people with disabilities.
  Our mission is to bridge the gap between traditional learning barriers and
  modern technology by creating an adaptive, user-friendly, and assistive
  learning environment for all.
  <br />
  <br />
  The platform provides an intuitive interface compatible with screen readers,
  voice commands, and keyboard navigation, ensuring a seamless experience for
  visually, hearing, or physically impaired learners. Courses are presented in
  multiple accessible formats—video lectures with captions, audio
  transcriptions, and interactive text modules—so that every learner can engage
  in the way that suits them best.
  <br />
  <br />
  AccessEdu empowers instructors to create inclusive courses using accessibility
  guidelines and AI-based tools that automatically adjust layouts, contrast, and
  readability. This allows educators to reach a broader audience while ensuring
  equal learning opportunities for everyone.
  <br />
  <br />
  Our platform also includes personalized dashboards, real-time communication
  features, and adaptive assessments that respond to each learner’s needs and
  pace. Whether you are a student seeking skill development or an organization
  focused on accessibility training, AccessEdu ensures that learning remains
  inclusive, efficient, and empowering.
  <br />
  <br />
  By combining technology, empathy, and innovation, AccessEdu is not just an
  e-learning solution—it’s a movement toward equal education. We believe that
  no disability should ever limit someone’s potential to learn, grow, or
  achieve their dreams. With AccessEdu, we’re making that belief a reality.
</p>

        <br />
        <span ref={founderNameRef} tabIndex={0} className="font-Cursive text-[22px]">Piyush Rajput</span>
        <h5 ref={founderTitleRef} className="text-[18px] font-Poppins">
          Founder and CEO of AccessEdu
        </h5>
        <br />
        <br />
        <br />
      </div>
    </div>
  );
};

export default About;
