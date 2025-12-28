import { styles } from "@/app/styles/styles";
import Image from "next/image";
import React, { useRef } from "react";
import ReviewsCard from "../Reviews/ReviewsCard";

type Props = {};

export const reviews = [
  {
    name: "Sarah Jenkins",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    profession: "Student | Washington University",
    comment:
      "The web development course was a game changer for me. I went from knowing nothing to building full-stack apps in just a few months. The project-based approach really helped solidify the concepts. Highly recommended!",
  },
  {
    name: "David Liu",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    profession: "Junior Developer | TechFlow",
    comment:
      "I used AccessEdu to brush up on my algorithms before technical interviews. The explanations are crystal clear and the practice problems are very relevant to what companies actually ask. It helped me land my first job!",
  },
  {
    name: "Priya Patel",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    profession: "Data Scientist | DataCorp",
    comment:
      "The Machine Learning specialization is top-notch. It covers everything from the math basics to deploying models in production. The community support is also fantastic—whenever I got stuck, someone was there to help.",
  },
  {
    name: "James Wilson",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    profession: "Freelancer",
    comment:
      "I've tried many learning platforms, but this one stands out for its practical focus. Building real-world projects gave me the confidence (and the portfolio) to start freelancing immediately after finishing the course.",
  },
  {
    name: "Emily Chen",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    profession: "UX Designer | Creative Studio",
    comment:
      "Great resources for designers too! The UI/UX courses helped me improve my design process significantly, and the dedicated modules on web accessibility were an eye-opener that changed how I design.",
  },
  {
    name: "Michael Brown",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    profession: "Student | Oxford University",
    comment:
      "What I love most is the flexibility. I can learn at my own pace and revisit complex topics whenever I need. The instructors are very responsive and the video quality is excellent.",
  },
];

const Reviews = (props: Props) => {

  return (
    <div className="w-[90%] 800px:[85%] m-auto">
      <div className="w-full 800px:flex items-center">
        <div className="800px:w-[50%] w-full pl-20">
          <Image
            src={require("../../../public/assets/3d-computer-website-loading-speed-test.jpg")}
            alt="businnes"
            width={500}
            height={500}
          />
        </div>
        <div className="800px:w-[50%] w-full pl-[20px]">
          <h3 className={`${styles.title} 800px:!text-[40px] 800px:!text-start`}>
            Our Students Are <span className="text-gradient">Our Strength</span>
            <br />
            See What They Say About Us
          </h3>
          <p className={`${styles.label} 800px:!text-start`}>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Architecto
            dolorem, consequuntur vitae facilis minima earum, doloribus nemo
            quisquam, ducimus perferendis qui quos. Iste facilis totam illo,
            placeat alias atque voluptas.
          </p>
        </div>
      </div>
      <br />
      <br />
      <div className="grid grid-cols-1 gap-[25px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-2 lg:gap-[25px] xl:grid-cols-2 xl:gap-[35px] mb-12 border-0">
        {reviews &&
          reviews.map((i, index) => <ReviewsCard item={i} key={index} />)}
      </div>
    </div>
  );
};

export default Reviews;
