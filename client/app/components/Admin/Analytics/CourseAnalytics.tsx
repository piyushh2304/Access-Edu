"use client";
import React, { useRef } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Label,
  YAxis,
  LabelList,
} from "recharts";
import Loader from "../../Loader";
import { useGetCoursesAnalyticsQuery } from "@/redux/features/analytics/analyticsApi";
import { styles } from "@/app/styles/styles";
import { useSpeechOnHover } from "@/app/hooks/useSpeechOnHover";

type Props = {};

const CourseAnalytics = (props: Props) => {
  const { data, isLoading, isError } = useGetCoursesAnalyticsQuery({});

  const analyticsData: any = [];

  data &&
    data.courses.last12Months.forEach((item: any) => {
      analyticsData.push({ name: item.month, uv: item.count });
    });

  const minValue = 0;

  const headingRef = useSpeechOnHover<HTMLHeadingElement>("Courses Analytics");
  const paragraphRef = useSpeechOnHover<HTMLParagraphElement>("Last 12 months analytics data");
  const chartRef = useSpeechOnHover<HTMLDivElement>("Courses analytics chart");

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="h-screen">
          <div className="mt-[50px]">
            <h1 ref={headingRef} tabIndex={0} className={`${styles.title} px-5 !text-start`}>
              Courses Analytics
            </h1>
            <p ref={paragraphRef} tabIndex={0} className={`${styles.label} px-5`}>
              Last 12 months analytis data
            </p>
          </div>

          <div ref={chartRef} tabIndex={0} className="w-full h-[90%] flex items-center justify-center">
            <ResponsiveContainer width="90%" height="50%">
              <BarChart width={150} height={300} data={analyticsData}>
                <XAxis dataKey="name">
                  <Label offset={0} position="insideBottom" />
                </XAxis>
                <YAxis domain={[minValue, "auto"]} />
                <Bar dataKey="uv" fill="#3faf82">
                  <LabelList dataKey="uv" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseAnalytics;