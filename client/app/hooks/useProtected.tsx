import { redirect } from "next/navigation";
import React from "react";
import Loader from "../components/Loader";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";

interface ProtectedProps {
    children: React.ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
  const { data, isLoading, isError, error } = useLoadUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  console.log("🔒 [DEBUG] Protected component:", { isLoading, isError, user: data?.user });

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !data?.user) {
    console.log("🚫 [DEBUG] Protected: Access denied, redirecting to home. Error details:", { 
      isError, 
      user: data?.user,
      error_object: error, // Log the actual error object
      data_dump: data
    });
    // return redirect("/"); // Bypassing redirect as per user request
  }

  return <>{children}</>;
}
