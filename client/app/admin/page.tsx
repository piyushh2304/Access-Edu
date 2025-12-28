"use client";
import React from "react";
import Heading from "../utils/Heading";
import dynamic from "next/dynamic";
import Loader from "../components/Loader";
import AdminProtected from "../hooks/adminProtected";

const LazyAdminSidebar = dynamic(
  () => import("../components/Admin/sidebar/AdminSidebar"),
  {
    loading: () => <Loader />,
  }
);

const LazyDashboardHero = dynamic(
  () => import("../components/Admin/DashboardHero"),
  {
    loading: () => <Loader />,
  }
);

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <AdminProtected>
        <Heading
          title="LMS - Admin"
          description="LMS is a platform for students to learn and get help from teachers"
          keywords="Programming, MERN, Redux, Machine Learning"
        />
        <div className="flex h-screen">
          <div className="1500px:w-[16%] w-1/5">
            <LazyAdminSidebar />
          </div>
          <div className="w-[85%]">
            <LazyDashboardHero isDashboard={true} />
          </div>
        </div>
      </AdminProtected>
    </div>
  );
};

export default page;
