"use client";
import { ThemeSwitcher } from "@/app/utils/ThemeSwitcher";
import React, { FC, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import DashboardHeader from "./sidebar/DashboardHeader";
import dynamic from "next/dynamic";
import Loader from "../Loader";

const DashboardWidgets = dynamic(() => import("./Widgets/DashboardWidgets"), {
  loading: () => <Loader />,
});

type Props = {
  isDashboard?: boolean;
};

const DashboardHero: FC<Props> = ({ isDashboard }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <DashboardHeader open={open} setOpen={setOpen} />
      {isDashboard && <DashboardWidgets open={open} />}
    </div>
  );
};
export default DashboardHero;
