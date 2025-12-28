"use client"
import { useSelector } from "react-redux"
import React from "react"
import { useRouter } from "next/navigation";
import Loader from "../components/Loader";

interface ProtectedProps {
    children: React.ReactNode
}

export default function AdminProtected({ children }: ProtectedProps) {
    const { user } = useSelector((state: any) => state.auth);
    const router = useRouter();

    // Show loader while checking auth
    if (!user) {
        return <Loader />;
    }

    // Check if user is admin
    const isAdmin = user?.role === "admin" || user?.role === "Admin";
    
    if (!isAdmin) {
        router.push("/");
        return <Loader />;
    }

    return <>{children}</>;
}