import React from "react";
import { Skeleton } from "../Skeleton";

const CourseCardSkeleton = () => {
  return (
    <div className="w-full min-h-[35vh] dark:bg-slate-500 dark:bg-opacity-20 backdrop-blur border dark:border-[#ffffff1d] border-[#0000015] dark:shadow-[bg-slate-700] rounded-lg p-3 shadow-sm dark:shadow-inner">
      <Skeleton className="w-full h-[200px] rounded-lg mb-4" /> {/* Thumbnail */}
      <div className="space-y-2">
        <Skeleton className="w-[80%] h-6" /> {/* Title */}
        <div className="w-full flex items-center justify-between pt-2">
          <Skeleton className="w-[100px] h-4" /> {/* Ratings */}
          <Skeleton className="w-[80px] h-4" /> {/* Student count */}
        </div>
        <div className="w-full flex items-center justify-between pt-3">
          <div className="flex gap-2">
            <Skeleton className="w-[40px] h-5" /> {/* Price */}
            <Skeleton className="w-[40px] h-4" /> {/* Estimated Price */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-[20px] h-4" /> {/* Icon */}
            <Skeleton className="w-[60px] h-4" /> {/* Lecture count */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;
