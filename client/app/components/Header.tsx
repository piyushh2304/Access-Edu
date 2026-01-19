"use client";
import Link from "next/link";
import React, { FC, useEffect, useState, useRef } from "react";
import NavItems from "../utils/NavItems";
import { ThemeSwitcher } from "../utils/ThemeSwitcher";
import { HiOutlineMenuAlt3, HiOutlineUserCircle, HiOutlineX } from "react-icons/hi";
import CustomModal from "../utils/CustomModal";
import Login from "../components/Auth/Login";
import SignUp from "../components/Auth/SignUp";
import Verification from "./Auth/Verification";
import { useSelector } from "react-redux";
import Image from "next/image";
import avatar from "../../public/assets/avatar.jpg";
import { useSession } from "next-auth/react";
import { useLogoutQuery, useSocialAuthMutation,} from "@/redux/features/auth/authApi";
import toast from "react-hot-toast";
import useAuth from "@/app/hooks/useAuth";
import { useSpeech } from "../SpeechProvider"; // Import useSpeech
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { attachSpeechEvents } from '../../lib/clientTTS';
import useSpeechOnHover from '../hooks/useSpeechOnHover';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: number;
  route: string;
  setRoute: (route: string) => void;
};

// Profile Image Link Component with speech on hover
const ProfileImageLink: FC<{
  userData: any;
  avatar: any;
  activeItem: number;
  profileImageRef: React.RefObject<HTMLAnchorElement>;
}> = ({ userData, avatar, activeItem, profileImageRef }) => {
  const profileText = userData?.user?.name 
    ? `View profile of ${userData.user.name}` 
    : "View profile";
  const profileLinkRef = useSpeechOnHover<HTMLAnchorElement>(profileText);
  
  // Merge refs using callback
  const combinedRef = React.useCallback((node: HTMLAnchorElement | null) => {
    profileLinkRef.current = node;
    if (profileImageRef) {
      (profileImageRef as React.MutableRefObject<HTMLAnchorElement | null>).current = node;
    }
  }, [profileImageRef, profileLinkRef]);

  return (
    <Link 
      ref={combinedRef} 
      href={"/profile"} 
      aria-label={profileText}
    >
      <Image
        src={
          userData.user.avatar ? userData.user.avatar.url : avatar
        }
        width={30}
        height={30}
        alt="" // Decorative, as link has aria-label
        className="w-[1.875rem] h-[1.875rem] object-cover rounded-full cursor-pointer"
        style={{
          border: activeItem === 5 ? "0.125rem solid #37a39a" : "none",
        }}
      />
    </Link>
  );
};

// Profile Button Component with speech on hover
const ProfileButton: FC<{
  profileButtonRef: React.RefObject<HTMLButtonElement>;
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ profileButtonRef, open, setOpen }) => {
  const buttonRef = useSpeechOnHover<HTMLButtonElement>("Open login or profile menu");
  
  // Merge refs using callback
  const combinedRef = React.useCallback((node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    if (profileButtonRef) {
      (profileButtonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    }
  }, [profileButtonRef, buttonRef]);

  return (
    <button
      ref={combinedRef}
      aria-label="Open login or profile"
      aria-haspopup="dialog"
      aria-expanded={open}
      className="hidden 800px:block cursor-pointer dark:text-white text-black"
      onClick={() => setOpen(true)}
    >
      <HiOutlineUserCircle size={24} />
    </button>
  );
};

// Mobile Profile Image Link Component with speech on hover
const MobileProfileImageLink: FC<{
  userData: any;
  avatar: any;
  activeItem: number;
}> = ({ userData, avatar, activeItem }) => {
  const profileText = userData?.user?.name 
    ? `View profile of ${userData.user.name}` 
    : "View profile";
  const profileLinkRef = useSpeechOnHover<HTMLAnchorElement>(profileText);

  return (
    <Link 
      ref={profileLinkRef} 
      href={"/profile"} 
      aria-label={profileText}
    >
      <Image
        src={
          userData.user.avatar ? userData.user.avatar.url : avatar
        }
        width={30}
        height={30}
        alt="" // Decorative, as link has aria-label
        className="ml-[20px] w-[1.875rem] h-[1.875rem] object-cover rounded-full cursor-pointer"
        style={{
          border: activeItem === 5 ? "0.125rem solid #37a39a" : "none",
        }}
      />
    </Link>
  );
};

const Header: FC<Props> = ({ activeItem, setOpen, route, open, setRoute }) => {
  const [active, setActive] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const [isClient, setIsClient] = useState(false);
  const { isTTSActive, toggleTTS, isVoiceControlActive, toggleVoiceControl, isVoiceListening, isVoiceAuthActive, toggleVoiceAuth } = useSpeech(); // Use the useSpeech hook
  const skipLinkRef = React.useRef<HTMLAnchorElement>(null);
  const logoRef = React.useRef<HTMLAnchorElement>(null);
  const themeSwitcherRef = React.useRef<HTMLButtonElement>(null);
  const ttsToggleButtonRef = React.useRef<HTMLButtonElement>(null);
  const profileButtonRef = React.useRef<HTMLButtonElement>(null);
  const profileImageRef = React.useRef<HTMLAnchorElement>(null);
  // const { user } = useSelector((state: any) => state.auth);
  const {
    data: userData,
    isLoading,
  } = useAuth();
  const { data: loadUserData, refetch } = useLoadUserQuery(undefined, { skip: !!userData?.user });
  const { data } = useSession();
  const [socialAuth, { isSuccess, error }] = useSocialAuthMutation();
  const [logout, setLogout] = useState(false);
  const {} = useLogoutQuery(undefined, {
    skip: !logout ? true : false,
  });

  // Use ref to track isTTSActive to avoid closure issues
  const isTTSActiveRef = useRef(isTTSActive);
  useEffect(() => {
    isTTSActiveRef.current = isTTSActive;
  }, [isTTSActive]);

  useEffect(() => {
    const cleanups: (() => void)[] = [];

    // Create getter function that reads from ref to always get current value
    const getIsActive = () => isTTSActiveRef.current;

    if (skipLinkRef.current) {
      cleanups.push(attachSpeechEvents(skipLinkRef.current, 'Skip to main content', getIsActive));
    }
    if (logoRef.current) {
      cleanups.push(attachSpeechEvents(logoRef.current, 'Access Edu home page link', getIsActive));
    }
    if (themeSwitcherRef.current) {
      cleanups.push(attachSpeechEvents(themeSwitcherRef.current, 'Toggle theme, current theme is ' + (document.documentElement.classList.contains('dark') ? 'dark' : 'light'), getIsActive));
    }
    if (ttsToggleButtonRef.current) {
      const buttonText = `Text to speech is currently ${isTTSActiveRef.current ? 'on' : 'off'}. Click to toggle.`;
      cleanups.push(attachSpeechEvents(ttsToggleButtonRef.current, buttonText, getIsActive));
    }
    if (profileButtonRef.current) {
      cleanups.push(attachSpeechEvents(profileButtonRef.current, 'Open login or profile menu', getIsActive));
    }
    if (profileImageRef.current && userData?.user?.name) {
      cleanups.push(attachSpeechEvents(profileImageRef.current, `View profile of ${userData.user.name}`, getIsActive));
    }
    if (menuButtonRef.current) {
      cleanups.push(attachSpeechEvents(menuButtonRef.current, 'Open mobile menu', getIsActive));
    }
    if (closeButtonRef.current) {
      cleanups.push(attachSpeechEvents(closeButtonRef.current, 'Close mobile menu', getIsActive));
    }

    return () => {
      cleanups.forEach(cleanup => cleanup?.());
    };
  }, [isTTSActive, userData]); // Re-attach if TTS active state or user data changes


  useEffect(() => {
    if (!isLoading) {
      console.log("Header useEffect check:", { isLoading, userData, nextAuthData: data });
      if (!userData) {
        if (data) {
          console.log("Triggering socialAuth with:", data.user);
          socialAuth({
            email: data?.user?.email,
            name: data?.user?.name,
            avatar: data?.user?.image,
          });
        } else {
             console.log("No NextAuth session data found");
        }
      }
      if (data === null) {
        if (isSuccess) {
          toast.success("Login successfully");
        }
      }
      // if (data === null && !isLoading && userData) {
      //   setLogout(true);
      // }
    }
  }, [data, userData, isLoading]);

  useEffect(() => {
    if (openSidebar) {
      closeButtonRef.current?.focus();
    }
  }, [openSidebar]);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 80) {
          setActive(true);
        } else {
          setActive(false);
        }
      });
    }
  }, []);

  // Listen for voice-open-form events to open login/signup modals
  useEffect(() => {
    const handleVoiceOpenForm = (event: CustomEvent) => {
      console.log('🎤 [DEBUG] Header received voice-open-form event:', event.detail);
      const formType = (event.detail as any)?.formType;
      if (formType === 'login') {
        setRoute('Login');
        setOpen(true);
        if (!isVoiceAuthActive) {
          toggleVoiceAuth();
        }
        if (!isVoiceControlActive) {
          toggleVoiceControl();
        }
        console.log('🎤 Opening login form via voice command');
      } else if (formType === 'signup' || formType === 'register') {
        setRoute('Sign-Up');
        setOpen(true);
        if (!isVoiceAuthActive) {
          toggleVoiceAuth();
        }
        if (!isVoiceControlActive) {
          toggleVoiceControl();
        }
        console.log('🎤 Opening signup form via voice command');
      }
    };

    window.addEventListener('voice-open-form', handleVoiceOpenForm as EventListener);
    return () => {
      window.removeEventListener('voice-open-form', handleVoiceOpenForm as EventListener);
    };
  }, [isVoiceAuthActive, isVoiceControlActive, setRoute, setOpen, toggleVoiceAuth, toggleVoiceControl]);

  // Auto-activate voice auth when login/signup modals are open
  useEffect(() => {
    if (open && (route === 'Login' || route === 'Sign-Up')) {
      if (!isVoiceAuthActive) {
        toggleVoiceAuth();
      }
      if (!isVoiceControlActive) {
        toggleVoiceControl();
      }
    }
  }, [open, route, isVoiceAuthActive, isVoiceControlActive, toggleVoiceAuth, toggleVoiceControl]);

  const handleSidebarClose = () => {
    setOpenSidebar(false);
    menuButtonRef.current?.focus();
  };

  const handleClose = (e: any) => {
    if (e.target.id === "screen") {
      handleSidebarClose();
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <header className="w-full relative">
      <a ref={skipLinkRef} href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:dark:bg-gray-800 focus:text-black focus:dark:text-white">
        Skip to main content
      </a>
      <div
        className={`${
          active
            ? "bg-white dark:bg-opacity-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 w-full z-[80] border-b dark:border-[#ffffff1c] shadow-xl transition duration-500"
            : "w-full border-b dark:border-[#ffffff1c] z-[80] dark:shadow"
        }`}
      >
        <div className="w-[94%] 800px:w-[92%] m-auto py-2">
          <div className="w-full h-[4.9375rem] flex items-center justify-between p-3">
            <div>
              <Link
                ref={logoRef}
                href={"/"}
                className={`text-2xl font-Poppins font-[500] text-black dark:text-white`}
              >
                AccessEdu
              </Link>
            </div>
            <div className="flex items-center">
              <NavItems activeItem={activeItem} isMobile={false} />
              <div ref={themeSwitcherRef} tabIndex={0}>
                <ThemeSwitcher />
              </div>
              {/* Voice Control Toggle Removed */}
           
              <div className="800px:hidden">
                <button
                  ref={menuButtonRef}
                  aria-label="Open mobile menu"
                  aria-expanded={openSidebar}
                  aria-controls="mobile-sidebar"
                  className="cursor-pointer dark:text-white text-black"
                  onClick={() => setOpenSidebar(true)}
                >
                  <HiOutlineMenuAlt3 size={24} />
                </button>
              </div>
              {userData && userData.user ? (
                <ProfileImageLink 
                  userData={userData} 
                  avatar={avatar} 
                  activeItem={activeItem}
                  profileImageRef={profileImageRef}
                />
              ) : (
                <ProfileButton 
                  profileButtonRef={profileButtonRef}
                  open={open}
                  setOpen={setOpen}
                />
              )}
            </div>
          </div>
          {/* mobile sidebar */}
          {openSidebar && (
            <div
              className="fixed w-full h-screen top-1 left-0 z-[99999] dark:bg-[unset] bg-[#00000024]"
              onClick={handleClose}
              id="screen"
            >
              <div 
                id="mobile-sidebar"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-menu-heading"
                className="w-[69%] fixed z-[9999999999] h-screen bg-white dark:bg-slate-900 dark:bg-opacity-90 top-0 right-0">
                <div className="flex justify-end p-4">
                  <button ref={closeButtonRef} onClick={handleSidebarClose} aria-label="Close mobile menu" className="dark:text-white text-black">
                      <HiOutlineX size={24} />
                  </button>
                </div>
                <h2 id="mobile-menu-heading" className="sr-only">Mobile Menu</h2>
                <NavItems activeItem={activeItem} isMobile={true} />
                {/* Voice Control Toggle - Mobile Removed */}
                {userData && userData.user ? (
                  <MobileProfileImageLink 
                    userData={userData} 
                    avatar={avatar} 
                    activeItem={activeItem}
                  />
                ) : (
                  <HiOutlineUserCircle
                    size={24}
                    className="hidden 800px:block cursor-pointer dark:text-white text-black"
                    onClick={() => setOpen(true)}
                  />
                )}
                <br />
                <br />
                <p className="text-sm px-2 pl-5 text-black dark:text-white">
                  Copyright @ 2023 AccessEdu
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* UD? */}
      {route === "Login" && (
        <>
          {open && (
            <CustomModal
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={Login}
              refetch={refetch}
            />
          )}
        </>
      )}
      {route === "Sign-Up" && (
        <>
          {open && (
            <CustomModal
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={SignUp}
            />
          )}
        </>
      )}
      {route === "Verification" && (
        <>
          {open && (
            <CustomModal
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={Verification}
            />
          )}
        </>
      )}
    </header>
  );
};

export default Header;
