'use client'
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { BiMoon, BiSun } from "react-icons/bi"

export const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme();

    useEffect(() => setMounted(true), [])

    if (!mounted) { return null }

    return (
        <div className="flex items-center justify-center mx-4">
            {
                theme === 'light' ? (
                    <button
                        onClick={() => setTheme("dark")}
                        aria-label="Switch to dark theme"
                        className="bg-transparent border-none p-0 cursor-pointer"
                    >
                        <BiMoon fill="black" size={25} />
                    </button>
                ) : (
                    <button
                        onClick={() => setTheme("light")}
                        aria-label="Switch to light theme"
                        className="bg-transparent border-none p-0 cursor-pointer"
                    >
                        <BiSun size={25} className="dark:text-white text-black" />
                    </button>
                )
            }
        </div>
    )
}
