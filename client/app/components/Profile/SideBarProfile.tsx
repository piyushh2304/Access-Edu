import React, { FC, useRef } from 'react'
import avatarDefault from "../../../public/assets/avatar.jpg"
import Image from 'next/image'
import { RiLockPasswordLine } from "react-icons/ri"
import { SiCoursera } from "react-icons/si"
import { AiOutlineLogout } from "react-icons/ai"
import { MdOutlineAdminPanelSettings } from "react-icons/md"
import Link from 'next/link'
import useSpeechOnHover from '../../hooks/useSpeechOnHover'


type Props = {
    user: any
    active: number
    avatar: string | null
    setActive: (active: number) => void
    logoutHandler: any
}

// Menu Item Component with speech on hover
const MenuItem: FC<{
    active: number;
    itemActive: number;
    onClick: () => void;
    icon: React.ReactNode;
    text: string;
    isLink?: boolean;
    href?: string;
    ttsLabel?: string; // Optional TTS label for better speech output
}> = ({ active, itemActive, onClick, icon, text, isLink, href, ttsLabel }) => {
    const menuItemRef = useSpeechOnHover<HTMLDivElement>(ttsLabel || text);
    const linkRef = useSpeechOnHover<HTMLAnchorElement>(ttsLabel || text);
    
    const className = `w-full flex items-center px-3 py-4 cursor-pointer ${active === itemActive ? "dark:bg-slate-800 bg-white" : "bg-transparent"}`;
    
    if (isLink && href) {
        return (
            <Link
                ref={linkRef}
                href={href}
                className={className}
                tabIndex={0}
            >
                {icon}
                <h5 className='pl-2 800px:block hidden font-Poppins dark:text-white text-black'>
                    {text}
                </h5>
            </Link>
        );
    }
    
    return (
        <div
            ref={menuItemRef}
            className={className}
            onClick={onClick}
            tabIndex={0}
            role="button"
            aria-label={text}
        >
            {icon}
            <h5 className='pl-2 800px:block hidden font-Poppins dark:text-white text-black'>
                {text}
            </h5>
        </div>
    );
};

const SideBarProfile: FC<Props> = ({ user, active, avatar, setActive, logoutHandler }) => {
    const avatarRef = useSpeechOnHover<HTMLImageElement>(user?.name ? `${user.name} profile picture` : "User profile picture");
    const myAccountRef = useSpeechOnHover<HTMLDivElement>("My Account");

    return (
        <div className='w-full'>
            <div
                ref={myAccountRef}
                className={`w-full flex items-center px-3 py-4 cursor-pointer ${active === 1 ? "dark:bg-slate-800 bg-white" : "bg-transparent"
                    }`}
                onClick={() => setActive(1)}
                tabIndex={0}
                role="button"
                aria-label="My Account"
            >
                <Image
                    ref={avatarRef}
                    src={avatar || (user?.avatar?.url || avatarDefault)}
                    alt='User avatar'
                    className='w-[20px] h-[20px] object-cover 800px:w-[30px] 800px:h-[30px] cursor-pointer rounded-full'
                    width={20}
                    height={20}
                />
                <h5
                    className='pl-2 800px:block hidden font-Poppins dark:text-white text-black'
                >
                    My Account
                </h5>
            </div>
            <MenuItem
                active={active}
                itemActive={2}
                onClick={() => setActive(2)}
                icon={<RiLockPasswordLine size={20} className='dark:text-white text-black' />}
                text="Change Password"
                ttsLabel="Change Password menu item"
            />
            <MenuItem
                active={active}
                itemActive={3}
                onClick={() => setActive(3)}
                icon={<SiCoursera size={20} className='dark:text-white text-black' />}
                text="Enrolled Courses"
                ttsLabel="Enrolled Courses menu item"
            />
            {
                (user?.role === "admin" || user?.role === "Admin") &&
                (
                    <MenuItem
                        active={active}
                        itemActive={6}
                        onClick={() => {}}
                        icon={<MdOutlineAdminPanelSettings size={20} className='dark:text-white text-black' />}
                        text="Admin Dashboard"
                        isLink={true}
                        href="/admin"
                        ttsLabel="Admin Dashboard link"
                    />
                )
            }
            {/* Debug: Show role info */}
            {user?.role && (
                <div className="px-3 py-2 text-xs text-gray-500">
                    Current role: {user.role}
                </div>
            )}
            <MenuItem
                active={active}
                itemActive={4}
                onClick={() => logoutHandler()}
                icon={<AiOutlineLogout size={20} className='dark:text-white text-black' />}
                text="Logout"
                ttsLabel="Logout button"
            />
        </div>
    )
}

export default SideBarProfile