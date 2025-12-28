import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { attachSpeechEvents } from "@/lib/clientTTS";
import { useSpeech } from "../SpeechProvider";

type Props = {};

const Footer = (props: Props) => {
  const { isTTSActive } = useSpeech();
  const aboutHeadingRef = useRef<HTMLHeadingElement>(null);
  const storyLinkRef = useRef<HTMLAnchorElement>(null);
  const privacyLinkRef = useRef<HTMLAnchorElement>(null);
  const faqLinkRef = useRef<HTMLAnchorElement>(null);

  const quickLinksHeadingRef = useRef<HTMLHeadingElement>(null);
  const coursesLinkRef = useRef<HTMLAnchorElement>(null);
  const myAccountLinkRef = useRef<HTMLAnchorElement>(null);
  const courseDashboardLinkRef = useRef<HTMLAnchorElement>(null);

  const socialLinksHeadingRef = useRef<HTMLHeadingElement>(null);
  const youtubeLinkRef = useRef<HTMLAnchorElement>(null);
  const instagramLinkRef = useRef<HTMLAnchorElement>(null);
  const githubLinkRef = useRef<HTMLAnchorElement>(null);

  const contactInfoHeadingRef = useRef<HTMLHeadingElement>(null);
  const callUs1Ref = useRef<HTMLParagraphElement>(null);
  const callUs2Ref = useRef<HTMLParagraphElement>(null);
  const callUs3Ref = useRef<HTMLParagraphElement>(null);

  const copyrightRef = useRef<HTMLParagraphElement>(null);

  // Use ref to track isTTSActive to avoid closure issues
  const isTTSActiveRef = useRef(isTTSActive);
  useEffect(() => {
    isTTSActiveRef.current = isTTSActive;
  }, [isTTSActive]);

  useEffect(() => {
    const cleanups: (() => void)[] = [];

    // Create getter function that reads from ref to always get current value
    const getIsActive = () => isTTSActiveRef.current;

    if (aboutHeadingRef.current) cleanups.push(attachSpeechEvents(aboutHeadingRef.current, 'About section heading', getIsActive));
    if (storyLinkRef.current) cleanups.push(attachSpeechEvents(storyLinkRef.current, 'Our Story link', getIsActive));
    if (privacyLinkRef.current) cleanups.push(attachSpeechEvents(privacyLinkRef.current, 'Privacy Policy link', getIsActive));
    if (faqLinkRef.current) cleanups.push(attachSpeechEvents(faqLinkRef.current, 'Frequently Asked Questions link', getIsActive));

    if (quickLinksHeadingRef.current) cleanups.push(attachSpeechEvents(quickLinksHeadingRef.current, 'Quick Links section heading', getIsActive));
    if (coursesLinkRef.current) cleanups.push(attachSpeechEvents(coursesLinkRef.current, 'Courses link', getIsActive));
    if (myAccountLinkRef.current) cleanups.push(attachSpeechEvents(myAccountLinkRef.current, 'My Account link', getIsActive));
    if (courseDashboardLinkRef.current) cleanups.push(attachSpeechEvents(courseDashboardLinkRef.current, 'Course Dashboard link', getIsActive));

    if (socialLinksHeadingRef.current) cleanups.push(attachSpeechEvents(socialLinksHeadingRef.current, 'Social Links section heading', getIsActive));
    if (youtubeLinkRef.current) cleanups.push(attachSpeechEvents(youtubeLinkRef.current, 'Youtube link', getIsActive));
    if (instagramLinkRef.current) cleanups.push(attachSpeechEvents(instagramLinkRef.current, 'Instagram link', getIsActive));
    if (githubLinkRef.current) cleanups.push(attachSpeechEvents(githubLinkRef.current, 'GitHub link', getIsActive));

    if (contactInfoHeadingRef.current) cleanups.push(attachSpeechEvents(contactInfoHeadingRef.current, 'Contact Info section heading', getIsActive));
    if (callUs1Ref.current) cleanups.push(attachSpeechEvents(callUs1Ref.current, callUs1Ref.current.textContent || '', getIsActive));
    if (callUs2Ref.current) cleanups.push(attachSpeechEvents(callUs2Ref.current, callUs2Ref.current.textContent || '', getIsActive));
    if (callUs3Ref.current) cleanups.push(attachSpeechEvents(callUs3Ref.current, callUs3Ref.current.textContent || '', getIsActive));

    if (copyrightRef.current) cleanups.push(attachSpeechEvents(copyrightRef.current, copyrightRef.current.textContent || '', getIsActive));

    return () => {
      cleanups.forEach(cleanup => cleanup?.());
    };
  }, [isTTSActive]);

  return (
    <footer>
      <div className="border border-[#0000000e] dark:border-[#ffffff1e]" />
      <br />
      <div className="w-[95%] 800px:w-full 800px:max-w-[85%] mx-auto px-2 sm:px-2 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <h3 ref={aboutHeadingRef} tabIndex={0} className="text-[20px] font-[600px] text-black dark:text-white">
              About
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  ref={storyLinkRef}
                  href="/about"
                  className="text-base text-black dark:text-gray-300 dark:hover-white"
                >
                  Our Stroy
                </Link>
              </li>
              <li>
                <Link
                  ref={privacyLinkRef}
                  href="/about"
                  className="text-base text-black dark:text-gray-300 dark:hover-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  ref={faqLinkRef}
                  href="/about"
                  className="text-base text-black dark:text-gray-300 dark:hover-white"
                >
                  Faq
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 ref={quickLinksHeadingRef} tabIndex={0} className="text-[20px] font-[600px] text-black dark:text-white">
              Quick Links
            </h3>
            <ul className="y-space-3">
              <li>
                <Link
                  ref={coursesLinkRef}
                  href="/about"
                  className="text-base text-black dark:text-gray-300 dark:hover-white"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  ref={myAccountLinkRef}
                  href="/about"
                  className="text-base text-black dark:text-gray-300 dark:hover-white"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  ref={courseDashboardLinkRef}
                  href="/about"
                  className="text-base text-black dark:text-gray-300 dark:hover-white"
                >
                  Course Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 ref={socialLinksHeadingRef} tabIndex={0} className="text-[20px] font-[600px] text-black dark:text-white">
              Social Links
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  ref={youtubeLinkRef}
                  href="/about"
                  className="text-base text-black dark:text-gray-300 dark:hover-white"
                >
                  Youtube
                </Link>
              </li>
              <li>
                <Link
                  ref={instagramLinkRef}
                  href="/about"
                  className="text-base text-black dark:text-gray-300 dark:hover-white"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  ref={githubLinkRef}
                  href="/about"
                  className="text-base text-black dark:text-gray-300 dark:hover-white"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 ref={contactInfoHeadingRef} tabIndex={0} className="text-[20px] font-[600px] text-black dark:text-white">
              Contact Info
            </h3>
            <br />
            <p ref={callUs1Ref} tabIndex={0} className="pb-2 text-base text-black dark:text-gray-300 dark:hover-white">
              Call us: 0435435093485
            </p>
            <p ref={callUs2Ref} tabIndex={0} className="pb-2 text-base text-black dark:text-gray-300 dark:hover-white">
              Call us: 0435435093485
            </p>
            <p ref={callUs3Ref} tabIndex={0} className="pb-2 text-base text-black dark:text-gray-300 dark:hover-white">
              Call us: 0435435093485
            </p>
          </div>
        </div>
        <br />
        <p ref={copyrightRef} tabIndex={0} className="text-center text-black dark:text-white">
          Copyriht @ 2023 AccessEdu | All Rights Reverse
        </p>
      </div>
      <br />
    </footer>
  );
};

export default Footer;
