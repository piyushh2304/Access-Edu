"use client";
import { useGetUsersAllCoursesQuery } from "@/redux/features/courses/courseApi";
import { useGetHeroDataQuery } from "@/redux/features/layout/layoutApi";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import Loader from "../components/Loader";
import Header from "../components/Header";
import Heading from "../utils/Heading";
import { styles } from "../styles/styles";
import CourseCard from "../components/Course/CourseCard";
import CourseCardSkeleton from "../components/Course/CourseCardSkeleton";
import Footer from "../components/Footer";
import CategoryButton from "../components/CategoryButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type Props = {};

const Page = (props: Props) => {
  const searchParams = useSearchParams();
  const search = searchParams?.get("title");
  const { data, isLoading } = useGetUsersAllCoursesQuery(undefined, {});
  const { data: categoriesData, isLoading: categoriesLoading } = useGetHeroDataQuery("Categories", {});
  const [route, setRoute] = useState("Login");
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [category, setCategory] = useState("All");
  const [searchInput, setSearchInput] = useState(search || "");

  const allCategoriesButtonRef = useRef<HTMLButtonElement>(null);
  const noCategoriesMessageRef = useRef<HTMLDivElement>(null);
  const noCourseFoundMessageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Sync local state with URL param if it changes
    setSearchInput(search || "");
  }, [search]);

  useEffect(() => {
    console.log("Data from useGetUsersAllCoursesQuery:", data);
    console.log("Categories data:", categoriesData);

    let filteredCourses = data?.courses || [];

    if (category !== "All") {
      filteredCourses = filteredCourses.filter((item: any) => item.categories === category);
    }

    if (searchInput) {
      filteredCourses = filteredCourses.filter((item: any) =>
        item.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.categories.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    setCourses(filteredCourses);
    
    console.log("Courses after filtering:", filteredCourses);
  }, [data, category, searchInput]);

  const categories = categoriesData?.layout?.categories ?? [];
  console.log("Categories data:", categoriesData);
  console.log("Categories:", categories);
  
  // Add error handling for when layout data is not available
  if (categoriesLoading) {
    console.log("Loading categories...");
  }
  
  if (!categoriesData?.layout && !categoriesLoading) {
    console.warn("Categories layout data is not available");
  }

  return (
    <main id="main-content">
      {isLoading || categoriesLoading ? (
        <>
        <Header
            route={route}
            setRoute={setRoute}
            open={open}
            setOpen={setOpen}
            activeItem={1}
          />
          <div className="w-[96%] 800px:w-[85%] m-auto min-h-[70vh]">
            <Heading
              title={"All course - AccessEdu"}
              description={"AccessEdu is a programming community"}
              keywords={
                "Programming comyunitty, coding skills, expret insights, colaboration, gorwthh"
              }
            />
            <br />
            <div className="w-full flex items-center flex-wrap">
                {/* Skeleton for categories */}
               {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-[35px] w-[100px] bg-slate-200 dark:bg-slate-700 m-3 rounded-[30px] animate-pulse"></div>
               ))}
            </div>
             <br />
            <br />
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] 1500px:grid-cols-4 1500px:gap-[35px] mb-12 border-0">
               {[...Array(4)].map((_, i) => (
                  <CourseCardSkeleton key={i} />
               ))}
            </div>
          </div>
          <Footer />
          </>
      ) : (
        <>
          <Header
            route={route}
            setRoute={setRoute}
            open={open}
            setOpen={setOpen}
            activeItem={1}
          />
          <div className="w-[96%] 800px:w-[85%] m-auto min-h-[70vh]">
            <Heading
              title={"All course - AccessEdu"}
              description={"AccessEdu is a programming community"}
              keywords={
                "Programming comyunitty, coding skills, expret insights, colaboration, gorwthh"
              }
            />
            <br />
            <br />
            {/* Search Input */}
            <div className="w-full flex justify-center mb-6">
              <div className="relative w-full max-w-xl flex gap-2">
                <div className="relative flex-1">
                    <Input
                      type="search"
                      placeholder="Search for courses..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 rounded-lg"
                      aria-label="Search for courses"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="w-full flex items-center flex-wrap">
              <button
                ref={allCategoriesButtonRef}
                className={`h-[35px] ${
                  category === "All" ? "bg-[crimson]" : "bg-[#5050cb]"
                } m-3 px-3 rounded-[30px] flex items-center justify-center font-Poppins cursor-pointer`}
                onClick={() => setCategory("All")}
                aria-label="Filter courses by All categories"
              >
                All
              </button>
              {categories && categories.length > 0 ? (
                categories.map((item: any) => (
                  <CategoryButton
                    key={item._id}
                    item={item}
                    category={category}
                    setCategory={setCategory}
                  />
                ))
              ) : (
                !categoriesLoading && (
                  <div ref={noCategoriesMessageRef} className="text-gray-500 text-sm ml-3">
                    No categories available
                  </div>
                )
              )}
            </div>
            {courses && courses.length === 0 && (
              <p
                ref={noCourseFoundMessageRef}
                className={`${styles.label} justify-center min-h-[50vh] flex items-center`}
              >
                {search
                  ? "No course found"
                  : "No courses found in this category. Please try another one!"}
              </p>
            )}
            <br />
            <br />
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] 1500px:grid-cols-4 1500px:gap-[35px] mb-12 border-0">
              {courses &&
                courses.map((item: any, index: number) => (
                  <CourseCard item={item} key={index} />
                ))}
            </div>
          </div>
          <Footer />
        </>
      )}
    </main>
  );
};

export default Page;
