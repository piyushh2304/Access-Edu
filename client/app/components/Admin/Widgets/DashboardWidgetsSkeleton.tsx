import React, { FC } from "react";
import { Skeleton } from "@/app/components/Skeleton";

type Props = {
  open?: boolean;
  value?: number;
};

const DashboardWidgetsSkeleton: FC<Props> = ({ open, value }) => {
  return (
    <div className="mt-[30px] min-h-screen">
      <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-2 lg:gap-[25px] xl:grid-cols-2 xl:gap-[35px] mb-12 border-0">
        <div className="p-8">
             {/* User Analytics Chart Skeleton */}
             <Skeleton className="w-full h-[300px] rounded-lg mb-4" />
        </div>
        
        <div className="pt-[80px] pr-8">
             {/* Stats Cards Skeleton */}
             <div className="w-full dark:bg-[#111C43] rounded-sm shadow p-5 mb-4">
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                         <Skeleton className="w-[30px] h-[30px] rounded-full" />
                         <Skeleton className="w-[100px] h-[20px]" />
                     </div>
                     <Skeleton className="w-[40px] h-[20px]" />
                </div>
                <div className="w-full flex flex-col items-center mt-4">
                     <Skeleton className="w-[30px] h-[30px] rounded-full mb-2" />
                     <Skeleton className="w-[60px] h-[30px]" />
                     <Skeleton className="w-[100px] h-[15px] mt-2" />
                </div>
             </div>

             <div className="w-full dark:bg-[#111C43] rounded-sm shadow p-5">
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                         <Skeleton className="w-[30px] h-[30px] rounded-full" />
                         <Skeleton className="w-[100px] h-[20px]" />
                     </div>
                     <Skeleton className="w-[40px] h-[20px]" />
                </div>
                <div className="w-full flex flex-col items-center mt-4">
                     <Skeleton className="w-[30px] h-[30px] rounded-full mb-2" />
                     <Skeleton className="w-[60px] h-[30px]" />
                     <Skeleton className="w-[100px] h-[15px] mt-2" />
                </div>
             </div>
        </div>
      </div>
      
       <div className="grid grid-cols-[65%,35%] mt-[-20px]">
           <div className="p-8 dark:bg-[#111c43] w-[94%] mt-[30px] h-[40vh] shadow-sm rounded-sm">
                <Skeleton className="w-[150px] h-[20px] mb-4" /> {/* "Order Analytics" */}
                <Skeleton className="w-full h-[80%] rounded-lg" />
           </div>
           <div className="p-5">
                <Skeleton className="w-full h-[250px] rounded-lg mt-[30px]" /> {/* Recent Transactions */}
           </div>
       </div>
    </div>
  );
};

export default DashboardWidgetsSkeleton;
