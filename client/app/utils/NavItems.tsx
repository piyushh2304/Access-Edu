import Link from 'next/link';
import React, { FC } from 'react';
import useSpeechOnHover from '../hooks/useSpeechOnHover';

export const navItemsData = [
    {
        name: "Home"
        , url: "/"
    },
    {
        name: "Courses"
        , url: "/courses"
    },
    {
        name: "About"
        , url: "/about"
    },
    {
        name: "Policy"
        , url: "/policy"
    },
    {
        name: "FAQ"
        , url: "/faq"
    }
]

type NavItemProps = {
    item: typeof navItemsData[0];
    index: number;
    activeItem: number;
    isMobile: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ item, index, activeItem, isMobile }) => {
    const navLinkRef = useSpeechOnHover<HTMLAnchorElement>(item.name);
    
    if (isMobile) {
        return (
            <Link
                ref={navLinkRef}
                href={item.url}
                className={`block py-5 text-[18px] px-6 font-Poppins font-[400] ${
                    activeItem === index ? "dark:text-[#37a39a] text-[crimson]" : "dark:text-white text-black"
                }`}
            >
                {item.name}
            </Link>
        );
    }
    
    return (
        <Link
            ref={navLinkRef}
            href={item.url}
            className={`text-[18px] px-6 font-Poppins font-[400] ${
                activeItem === index ? "dark:text-[#37a39a] text-[crimson]" : "dark:text-white text-black"
            }`}
        >
            {item.name}
        </Link>
    );
};

type Props = {
    activeItem: number;
    isMobile: boolean
}

const NavItems: React.FC<Props> = ({ activeItem, isMobile }) => {
    return (
        <>
            <nav className="hidden 800px:flex" aria-label="Main navigation">
                {
                    navItemsData && navItemsData.map((i, index) => (
                        <NavItem
                            key={index}
                            item={i}
                            index={index}
                            activeItem={activeItem}
                            isMobile={false}
                        />
                    ))
                }
            </nav>
            {
                isMobile && (
                    <nav className="800px:hidden mt-5" aria-label="Main navigation">
                        <div className="w-full text-center py-6">
                            <Link
                                href="/"
                                className="text-[25px] font-Poppins font-[500] text-black dark:text-white"
                            >
                                AccessEdu
                            </Link>
                        </div>
                        {
                            navItemsData && navItemsData.map((i, index) => (
                                <NavItem
                                    key={index}
                                    item={i}
                                    index={index}
                                    activeItem={activeItem}
                                    isMobile={true}
                                />
                            ))
                        }

                    </nav>
                )
            }
        </>
    )
}

export default NavItems;