"use client";
import React, { FC, useState } from "react";
import Heading from "./utils/Heading";
import Header from "./components/Header";
import Hero from "./components/Route/Hero";
// import ClientTTSDemo from "./components/ClientTTSDemo";
import Courses from "./components/Route/Courses";
import Reviews from "./components/Route/Reviews";
import FAQ from "./components/FAQ/FAQ";
import Footer from "./components/Footer";
import { AccessibilityButton } from "./components/Accessibility/AccessibilityButton";
import { GlobalAccessibility } from "./components/Accessibility/GlobalAccessibility";

interface Props {}

const Page: FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const [route, setRoute] = useState("Login");

  return (
    <main id="main-content">
      <Heading
        title="AccessEdu"
        description="AccessEdu is a prlatform for student to learn and get help from teachers"
        keywords="Programming, MERN, Redux, Machine Learning"
      />
      <Header
        open={open}
        setOpen={setOpen}
        activeItem={activeItem}
        setRoute={setRoute}
        route={route}
      />
      <Hero />
      {/* <ClientTTSDemo /> */}
      <Courses />
      <Reviews />
      <FAQ />
      <Footer />
      <GlobalAccessibility />
      <AccessibilityButton />
    </main>
  );
};

export default Page;
