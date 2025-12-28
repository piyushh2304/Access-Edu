"use client";
import Ratings from "@/app/utils/Ratings";
import Image from "next/image";
import React, { useRef } from "react";

type Props = {
  item: any;
};

const ReviewsCard = (props: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const professionRef = useRef<HTMLHeadingElement>(null);
  const commentRef = useRef<HTMLParagraphElement>(null);

  return (
    <div ref={cardRef} tabIndex={0} className="w-full h-[200px] overflow-hidden pb-4 dark:bg-slate-500 dark:bg-opacity-20 backdrop-blur border dark:border-[#ffffff1d] border-[#0000015] dark:shadow-[bg-slate-700] rounded-lg p-3 shadow-sm dark:shadow-inner">
      <div className="flex w-full">
        <Image
          ref={avatarRef}
          src={props.item.avatar}
          width={50}
          height={50}
          className="w-[50px] h-[50px] rounded-full object-cover"
          alt={`Avatar of ${props.item.name}`}
        />
        <div className="800px:flex justify-between w-full hidden">
          <div className="pl-4">
            <h5 ref={nameRef} tabIndex={0} className="text-[20px] text-black dark:text-white">
              {props.item.name}
            </h5>
            <h6 ref={professionRef} tabIndex={0} className="text-[16px] text-[#000] dark:text-[#ffffffab]">
              {props.item.profession}
            </h6>
          </div>
          <Ratings rating={props.item.rating} />
        </div>
        {/* for mobile */}
        <div className="800px:hidden justify-between w-full flex flex-col">
          <div className="pl-4">
            <h5 ref={nameRef} tabIndex={0} className="text-[20px] text-black dark:text-white">
              {props.item.name}
            </h5>
            <h6 ref={professionRef} tabIndex={0} className="text-[16px] text-[#000] dark:text-[#ffffffab]">
              {props.item.profession}
            </h6>
            <Ratings rating={props.item.rating} />
          </div>
        </div>
      </div>
      <p ref={commentRef} tabIndex={0} className="pt-2 px-2 font-Poppins text-black dark:text-white h-[150px] overflow-y-auto custom-scrollbar">
        {props.item.comment}
      </p>
    </div>
  );
};

export default ReviewsCard;
