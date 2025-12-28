import React from "react";
import { Skeleton } from "../Skeleton";

const CourseDetailSkeleton = () => {
  return (
    <div className="w-[90%] 800px:w-[90%] m-auto py-5">
      <div className="w-full flex flex-col-reverse 800px:flex-row">
        {/* Left Content */}
        <div className="w-full 800px:w-[65%] 800px:pr-[50px]">
          <Skeleton className="h-[40px] w-[60%] mb-4" /> {/* Title */}
          <div className="flex items-center justify-between pt-3 mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-[20px] w-[100px]" /> {/* Ratings */}
              <Skeleton className="h-[20px] w-[80px]" /> {/* Review Count */}
            </div>
            <Skeleton className="h-[20px] w-[80px]" /> {/* Student Count */}
          </div>

          <Skeleton className="h-[30px] w-[40%] mb-4" /> {/* "What you will learn" */}
          <div className="space-y-2 mb-8">
             {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[20px] w-full" /> 
             ))}
          </div>

          <Skeleton className="h-[30px] w-[40%] mb-4" /> {/* "Prerequisites" */}
          <div className="space-y-2 mb-8">
             {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[20px] w-full" /> 
             ))}
          </div>

           <Skeleton className="h-[30px] w-[40%] mb-4" /> {/* "Course Overview" */}
           <Skeleton className="h-[300px] w-full mb-8" /> {/* Course Content List */}

           <Skeleton className="h-[30px] w-[40%] mb-4" /> {/* "Course Details" */}
           <Skeleton className="h-[100px] w-full mb-8" /> {/* Description */}
        </div>

        {/* Right Sidebar (Video Player) */}
        <div className="w-full 800px:w-[35%] relative">
          <div className="sticky top-[100px] left-0 z-50 w-full">
            <Skeleton className="w-full aspect-video rounded-md mb-4" /> {/* Video */}
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-[30px] w-[80px]" /> {/* Price */}
                <Skeleton className="h-[25px] w-[60px]" /> {/* Discount */}
            </div>
            <Skeleton className="h-[45px] w-[180px] rounded-[30px] mb-4" /> {/* Button */}
            <div className="space-y-2">
                <Skeleton className="h-[15px] w-[150px]" />
                <Skeleton className="h-[15px] w-[150px]" />
                <Skeleton className="h-[15px] w-[150px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailSkeleton;
