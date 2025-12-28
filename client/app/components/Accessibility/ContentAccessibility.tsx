'use client';

import React, { useEffect } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityProvider';

export const ContentAccessibility: React.FC = () => {
  const { contentAccessibilityEnabled } = useAccessibility();

  useEffect(() => {
    if (!contentAccessibilityEnabled) return;

    // Ensure all images have alt text
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      if (!imgElement.alt) {
        imgElement.alt = imgElement.src.split('/').pop() || 'Image';
        imgElement.setAttribute('aria-label', imgElement.alt);
      }
    });

    // Ensure all videos have captions
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      const videoElement = video as HTMLVideoElement;
      if (!videoElement.hasAttribute('aria-label')) {
        const title = videoElement.getAttribute('title') || 
                     videoElement.getAttribute('data-title') ||
                     'Video content';
        videoElement.setAttribute('aria-label', title);
      }
      
      // Check for track elements (captions)
      if (!videoElement.querySelector('track[kind="captions"]')) {
        console.warn('Video without captions detected:', videoElement);
      }
    });

    // Ensure all form inputs have labels
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])');
    inputs.forEach((input) => {
      const inputElement = input as HTMLInputElement;
      const id = inputElement.id || `input-${Date.now()}-${Math.random()}`;
      if (!inputElement.id) {
        inputElement.id = id;
      }
      
      // Check if label exists
      const label = document.querySelector(`label[for="${id}"]`);
      if (!label) {
        // Try to find parent label
        const parentLabel = inputElement.closest('label');
        if (!parentLabel) {
          console.warn('Input without label detected:', inputElement);
        }
      }
    });

    // Ensure all buttons have accessible names
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach((button) => {
      const buttonElement = button as HTMLButtonElement;
      if (!buttonElement.textContent?.trim() && !buttonElement.getAttribute('aria-label')) {
        const title = buttonElement.getAttribute('title') || 'Button';
        buttonElement.setAttribute('aria-label', title);
      }
    });

    // Ensure all links have accessible text
    const links = document.querySelectorAll('a:not([aria-label]):not([aria-labelledby])');
    links.forEach((link) => {
      const linkElement = link as HTMLAnchorElement;
      if (!linkElement.textContent?.trim() && !linkElement.getAttribute('aria-label')) {
        const title = linkElement.getAttribute('title') || 
                     linkElement.href.split('/').pop() || 
                     'Link';
        linkElement.setAttribute('aria-label', title);
      }
    });

    // Add skip links if not present
    if (!document.getElementById('skip-to-content')) {
      const skipLink = document.createElement('a');
      skipLink.id = 'skip-to-content';
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[10000] focus:p-4 focus:bg-white focus:text-black focus:underline';
      skipLink.setAttribute('aria-label', 'Skip to main content');
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Ensure proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1 && lastLevel > 0) {
        console.warn('Heading hierarchy skipped:', heading);
      }
      lastLevel = level;
    });

  }, [contentAccessibilityEnabled]);

  return null;
};

