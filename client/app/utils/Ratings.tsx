"use client";
import React, { FC, useRef } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BiSolidStarHalf } from "react-icons/bi";

type Props = {
  rating: number;
};

const Ratings: FC<Props> = ({ rating }) => {
  const ratingContainerRef = useRef<HTMLDivElement>(null);
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(
        <AiFillStar
          key={i}
          size={20}
          color="#f6b100"
          className="mr-2 cursor-pointer"
          aria-label={`${i} star`}
        />
      );
    } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
      stars.push(
        <BiSolidStarHalf
          key={i}
          size={17}
          color="#f6b100"
          className="mr-2 cursor-pointer"
          aria-label={`${i - 0.5} stars`}
        />
      );
    } else {
      stars.push(
        <AiOutlineStar
          key={i}
          size={20}
          color="#f6b100"
          className="mr-2 cursor-pointer"
          aria-label={`${i} star`}
        />
      );
    }
  }
  return <div ref={ratingContainerRef} className="flex ml-2 800px:mt-2 800px:ml-0"> {stars}</div>;
};

export default Ratings;
