import React from "react";
import { Skeleton } from "@/app/components/Skeleton";

const TableSkeleton = () => {
  return (
    <div className="mt-12">
      <div className="w-full bg-white dark:bg-[#111c43] rounded-sm shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-[#ffffff1d]">
              <Skeleton className="w-[150px] h-[30px]" />
              <Skeleton className="w-[100px] h-[35px] rounded-[30px]" />
          </div>
          {/* Rows */}
          <div className="p-4 space-y-4">
              {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                      <Skeleton className="w-[20%] h-[20px]" />
                      <Skeleton className="w-[15%] h-[20px]" />
                      <Skeleton className="w-[20%] h-[20px]" />
                      <Skeleton className="w-[10%] h-[20px]" />
                      <Skeleton className="w-[10%] h-[20px]" />
                      <div className="flex gap-2">
                        <Skeleton className="w-[30px] h-[30px] rounded-full" />
                        <Skeleton className="w-[30px] h-[30px] rounded-full" />
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
