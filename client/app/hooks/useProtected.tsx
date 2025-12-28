import { redirect } from "next/navigation";
import React from "react";
import Loader from "../components/Loader";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";

interface ProtectedProps {
    children: React.ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
  const { data, isLoading, isError } = useLoadUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !data?.user) {
    return redirect("/");
  }

  return <>{children}</>;
}
