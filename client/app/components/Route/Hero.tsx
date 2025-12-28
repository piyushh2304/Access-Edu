// "use client";
// import { styles } from "@/app/styles/styles";
// import {
//   useEditLayoutMutation,
//   useGetHeroDataQuery,
// } from "@/redux/features/layout/layoutApi";
// import React, { FC, useEffect, useState } from "react";
// import Loader from "../Loader";
// import { useRouter } from "next/navigation";
// import { BiSearch } from "react-icons/bi";
// import { AnimatedText } from "@/components/ui/animated-shiny-text";

// type Props = {};

// const Hero: FC<Props> = () => {
//   const [image, setImage] = useState("");
//   const [title, setTitle] = useState("");
//   const [subTitle, setSubTitle] = useState("");
//   const { data, isLoading } = useGetHeroDataQuery("Banner", {
//     refetchOnMountOrArgChange: true,
//   });
//   const [search, setSearch] = useState("");
//   const router = useRouter();

//   useEffect(() => {
//     if (data) {
//       setTitle(data?.layout?.banner.title);
//       setSubTitle(data?.layout?.banner.subTitle);
//       setImage(data?.layout?.banner?.image?.url || "");
//     }
//   }, [data]);

//   const handleSearch = () => {
//     if (search.trim() !== "") router.push(`/courses?title=${search}`);
//   };

//   return (
//     <>
//       {isLoading ? (
//         <Loader />
//       ) : (
//         <div className="w-full 1000px:flex items-center relative overflow-hidden">
//           {/* ===== Left Section (Purple Circle + AccessEdu text) ===== */}
//           <div className="relative 1000px:w-[40%] flex 1000px:min-h-screen items-center justify-end pt-[70px] 1000px:pt-[0]">
//             {/* Purple Circular Background */}
//             <div
//               className="relative flex items-center justify-center rounded-full
//               h-[50vh] w-[50vh] 1100px:h-[500px] 1100px:w-[500px]
//               1500px:h-[700px] 1500px:w-[700px]
//               1100px:left-[5rem] 1500px:left-[10rem] overflow-hidden"
//               style={{ backgroundImage: 'linear-gradient(45deg, #575757 0%, #9200c2 100%)', boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)' }}
//             >
//               {/* Inner Circle with Text */}
//               <div className="flex items-center justify-center h-[80%] w-[80%] rounded-full bg-white/10">
//                 <span className="text-4xl 1500px:text-6xl font-bold text-white font-serif">
//                   {/* <AnimatedText text="AccessEdu" />
//                    */}
//                    AccessEdu
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* ===== Right Section (Text + Search) ===== */}
//           <div className="1000px:w-[60%] pl-[250px] pr-[150px] flex flex-col items-center 1000px:mt-[0px] text-center 1000px:text-left mt-[150px]">
//             <p className="px-10 focus:outline-none text-foreground w-full font-[600] text-[30px] 1000px:text-[60px] 1500px:text-[70px] bg-transparent resize-none">
//               {title}
//             </p>
//             <br />
//             <p className="px-10 focus:outline-none dark:text-white text-black w-full font-[600] text-[8px] 1000px:text-[15px] 1500px:text-[20px] bg-transparent resize-none">
//               {subTitle}
//             </p>
//             <br />
//             <br />
//             <div className="ml-[-200px] 1500px:w-[55%] 1100px:w-[78%] w-[90%] h-[50px] bg-transparent relative">
//               <input
//                 type="text"
//                 placeholder="Search Courses..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="bg-transparent border dark:border-none dark:bg-[#575757] dark:placeholder:text-[#ffffffdd] rounded-[5px] p-2 w-full h-full outline-none text-black dark:text-white"
//               />
//               <div
//                 className="absolute flex items-center justify-center w-[50px] cursor-pointer h-[50px] right-0 top-0 bg-[#39c1f3] rounded-r-[5px]"
//                 onClick={handleSearch}
//               >
//                 <BiSearch className="text-white" size={30} />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Hero;

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Search, Accessibility, BookOpen, Users, Info, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { attachSpeechEvents } from "@/lib/clientTTS";
import { useSpeech } from "../../SpeechProvider";
import { AccessibilityFeaturesDescription } from "../Accessibility/AccessibilityFeaturesDescription";
import useSpeechOnHover from "../../hooks/useSpeechOnHover";

export default function Hero() {
  const [search, setSearch] = useState("");
  const [showAccessibilityDescription, setShowAccessibilityDescription] = useState(false);
  const { 
    isTTSActive, 
    toggleTTS,
    isVoiceControlActive,
    toggleVoiceControl
  } = useSpeech();
  
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/courses?title=${search}`);
    }
  };

  const badgeRef = useRef<HTMLDivElement>(null);
  const welcomeHeadingRef = useRef<HTMLHeadingElement>(null);
  const accessEduHeadingRef = useRef<HTMLSpanElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const coursesStatRef = useRef<HTMLDivElement>(null);
  const studentsStatRef = useRef<HTMLDivElement>(null);
  const accessibilityDescriptionButtonRef = useSpeechOnHover<HTMLButtonElement>('Accessibility features description button. Click to view all disability features');

  // Use ref to track isTTSActive to avoid closure issues
  const isTTSActiveRef = useRef(isTTSActive);
  useEffect(() => {
    isTTSActiveRef.current = isTTSActive;
  }, [isTTSActive]);

  useEffect(() => {
    const cleanups: (() => void)[] = [];

    // Create getter function that reads from ref to always get current value
    const getIsActive = () => isTTSActiveRef.current;

    if (badgeRef.current) {
      cleanups.push(attachSpeechEvents(badgeRef.current, 'Education for Everyone badge', getIsActive));
    }
    if (welcomeHeadingRef.current) {
      cleanups.push(attachSpeechEvents(welcomeHeadingRef.current, 'Welcome to', getIsActive));
    }
    if (accessEduHeadingRef.current) {
      cleanups.push(attachSpeechEvents(accessEduHeadingRef.current, 'AccessEdu, your learning platform', getIsActive));
    }
    if (descriptionRef.current) {
      cleanups.push(attachSpeechEvents(descriptionRef.current, descriptionRef.current.textContent || '', getIsActive));
    }
    if (searchInputRef.current) {
      cleanups.push(attachSpeechEvents(searchInputRef.current, searchInputRef.current.placeholder, getIsActive));
    }
    if (searchButtonRef.current) {
      cleanups.push(attachSpeechEvents(searchButtonRef.current, 'Search button', getIsActive));
    }
    if (coursesStatRef.current) {
      cleanups.push(attachSpeechEvents(coursesStatRef.current, 'Over 500 courses available', getIsActive));
    }
    if (studentsStatRef.current) {
      cleanups.push(attachSpeechEvents(studentsStatRef.current, 'Over 10 thousand students enrolled', getIsActive));
    }

    return () => {
      cleanups.forEach(cleanup => cleanup?.());
    };
  }, [isTTSActive]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Speech on Hover Toggle - Corner Position */}
      <div className="fixed top-32 right-4 z-50 flex flex-col gap-2">
        <button
          aria-label={`Speech on hover is currently ${isTTSActive ? 'on' : 'off'}. Click to toggle.`}
          className="cursor-pointer dark:text-white text-black flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700"
          onClick={toggleTTS}
        >
          {isTTSActive ? (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          ) : (
            <span className="relative flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
            </span>
          )}
          <span className="text-sm font-medium hidden sm:inline">Speech on Hover</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:inline">
            {isTTSActive ? 'On' : 'Off'}
          </span>
        </button>

        {/* Accessibility Features Description Button */}
        <button
          ref={accessibilityDescriptionButtonRef}
          aria-label="View description of all accessibility features"
          className="cursor-pointer dark:text-white text-black flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700"
          onClick={() => setShowAccessibilityDescription(true)}
        >
          <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium hidden sm:inline">Accessibility Features</span>
        </button>

        {/* Voice Control Toggle */}
        <button
          aria-label={`Voice control is currently ${isVoiceControlActive ? 'on' : 'off'}. Click to toggle.`}
          className="cursor-pointer dark:text-white text-black flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700"
          onClick={toggleVoiceControl}
        >
          {isVoiceControlActive ? (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          ) : (
            <span className="relative flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
            </span>
          )}
          <span className="text-sm font-medium hidden sm:inline">Voice Control</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:inline">
            {isVoiceControlActive ? 'On' : 'Off'}
          </span>
        </button>
      </div>

      {/* Accessibility Features Description Modal */}
      <AccessibilityFeaturesDescription
        isOpen={showAccessibilityDescription}
        onClose={() => setShowAccessibilityDescription(false)}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center py-20">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            ref={badgeRef}
            tabIndex={0}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700"
          >
            <Accessibility className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <span className="text-purple-700 dark:text-purple-300">Education for Everyone</span>
          </motion.div>

          {/* Main Heading */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-gray-900 dark:text-white"
            >
              <span ref={welcomeHeadingRef} tabIndex={0} className="block">Welcome to</span>
              <span ref={accessEduHeadingRef} tabIndex={0} className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AccessEdu
              </span>
            </motion.h1>
            <motion.p
              ref={descriptionRef}
              tabIndex={0}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-gray-600 dark:text-gray-300 max-w-xl"
            >
              Empowering learners with disabilities through accessible, inclusive, and personalized online education. 
              Learn at your own pace with tools designed for everyone.
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            onSubmit={handleSearch}
            className="flex gap-2 max-w-xl"
          >
            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search for courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                aria-label="Search for courses"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            </div>
            <Button 
              ref={searchButtonRef}
              type="submit" 
              size="lg" 
              className="h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Search
            </Button>
          </motion.form>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex gap-8 pt-4"
          >
            <div ref={coursesStatRef} tabIndex={0} className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
              <div>
                <p className="text-gray-900 dark:text-white">500+</p>
                <p className="text-gray-600 dark:text-gray-400">Courses</p>
              </div>
            </div>
            <div ref={studentsStatRef} tabIndex={0} className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <div>
                <p className="text-gray-900 dark:text-white">10K+</p>
                <p className="text-gray-600 dark:text-gray-400">Students</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Visual - Animated Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] rounded-full border-2 border-dashed border-purple-300 dark:border-purple-600"
          />
          
          {/* Main circle */}
          <div className="relative w-[350px] h-[350px] lg:w-[450px] lg:h-[450px] rounded-full bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 shadow-2xl flex items-center justify-center">
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
            
            {/* Content */}
            <div className="relative z-10 text-center space-y-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <Accessibility className="w-24 h-24 text-white mx-auto mb-4" aria-hidden="true" />
              </motion.div>
              <h2 className="text-white">
                AccessEdu
              </h2>
              <p className="text-purple-100 max-w-[250px] mx-auto">
                Breaking barriers in education
              </p>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute top-10 right-10 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <BookOpen className="w-8 h-8 text-white" aria-hidden="true" />
            </motion.div>
            
            <motion.div
              className="absolute bottom-10 left-10 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <Users className="w-8 h-8 text-white" aria-hidden="true" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
