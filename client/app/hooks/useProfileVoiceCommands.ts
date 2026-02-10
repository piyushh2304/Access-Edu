// client/app/hooks/useProfileVoiceCommands.ts
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSpeech } from '../SpeechProvider';

interface ProfileVoiceCommandsProps {
  isActive: boolean;
  setActive: (active: any) => void;
  logoutHandler: () => void;
  userRole?: string;
  onCommandRecognized?: (command: string) => void;
}

// Profile-specific voice commands
// Minimum confidence score required for speech recognition (0.0 to 1.0)
// Higher values = more accurate but may reject valid commands
// Lower values = more lenient but may accept incorrect transcriptions
const MIN_CONFIDENCE_THRESHOLD = 0.3;

const PROFILE_COMMANDS = [
  // Open Profile commands - navigate to profile page or switch to My Account section
  // Navigation commands added to profile hook to handle them while global nav is paused
  { keywords: ['open home', 'go home', 'go to home', 'home'], action: 'go-home' },
  { keywords: ['open courses', 'go to courses', 'courses'], action: 'go-courses' },
  { keywords: ['open about', 'go to about', 'about'], action: 'go-about' },
  { keywords: ['open faq', 'go to faq', 'faq'], action: 'go-faq' },
  { keywords: ['open policy', 'go to policy', 'policy'], action: 'go-policy' },

  // Open Profile commands - navigate to profile page or switch to My Account section
  { keywords: ['open profile', 'go to profile', 'show profile', 'profile', 'my profile', 'open my profile', 'go to my profile'], action: 'open-profile' },

  // My Account commands
  { keywords: ['my account', 'account', 'profile info', 'profile information'], action: 1 },
  { keywords: ['open my account', 'go to my account', 'show my account'], action: 1 },

  // Change Password commands
  { keywords: ['change password', 'update password', 'password'], action: 2 },
  { keywords: ['open change password', 'go to change password', 'show change password'], action: 2 },

  // Enrolled Courses commands
  { keywords: ['enrolled courses', 'my courses', 'courses', 'my enrolled courses'], action: 3 },
  { keywords: ['open enrolled courses', 'go to enrolled courses', 'show enrolled courses', 'open courses'], action: 3 },

  // Logout commands
  { keywords: ['logout', 'log out', 'sign out', 'signout'], action: 'logout' },

  // Admin Dashboard commands
  { keywords: ['admin dashboard', 'admin', 'dashboard', 'admin panel'], action: 'admin' },
  { keywords: ['open admin', 'go to admin', 'open admin dashboard'], action: 'admin' },

  // ProfileInfo component commands
  { keywords: ['update profile', 'save profile', 'update account'], action: 'update-profile' },
  { keywords: ['change avatar', 'update avatar', 'change picture', 'update picture'], action: 'change-avatar' },

  // ChangePassword component commands
  { keywords: ['update password', 'save password', 'change password now'], action: 'update-password' },
];

export const useProfileVoiceCommands = ({
  isActive,
  setActive,
  logoutHandler,
  userRole,
  onCommandRecognized,
}: ProfileVoiceCommandsProps) => {
  const router = useRouter();
  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isStartingRef = useRef(false);
  const lastCommandTimeRef = useRef<number>(0);
  const PROCESSING_COOLDOWN = 1000;
  const { speak, isTTSActive } = useSpeech();

  useEffect(() => {
    if (!isActive) {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors when stopping
        }
        recognitionRef.current = null;
      }
      isStartingRef.current = false;
      return;
    }

    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      console.warn('Web Speech API is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // Clean up previous recognition if exists
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
      recognitionRef.current = null;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true; // Keep listening
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    const safeStart = () => {
      if (!recognitionRef.current || !isActive || isStartingRef.current) {
        return;
      }

      try {
        // Check if already started by checking the state
        if (recognitionRef.current && typeof (recognitionRef.current as any).state !== 'undefined') {
          const state = (recognitionRef.current as any).state;
          if (state === 'listening' || state === 'starting') {
            return;
          }
        }

        isStartingRef.current = true;
        recognitionRef.current.start();
      } catch (error: any) {
        // Only log if it's not "already started" error
        if (error.name !== 'InvalidStateError' && !error.message?.includes('already started')) {
          console.error('Error starting speech recognition:', error);
        }
        isStartingRef.current = false;
      }
    };

    recognitionRef.current.onresult = (event: any) => {
      if (Date.now() - lastCommandTimeRef.current < PROCESSING_COOLDOWN) return;

      // Get the most recent result with confidence score
      const results = Array.from(event.results as any);
      const lastResult = results[results.length - 1] as any;
      const lastAlternative = lastResult[0] as any;

      // Check confidence score - only process if confidence meets threshold
      const confidence = lastAlternative?.confidence ?? 0;
      if (confidence < MIN_CONFIDENCE_THRESHOLD) {
        console.log(`⚠️ Low confidence result ignored (${confidence.toFixed(2)} < ${MIN_CONFIDENCE_THRESHOLD}): "${lastAlternative?.transcript}"`);
        return;
      }

      // Get transcript from the most confident result or interim
      const transcript = lastAlternative?.transcript?.toLowerCase().trim() || '';

      if (!transcript) return;

      console.log(`Profile voice input (interim: ${!lastResult.isFinal}):`, transcript);

      const executeCommand = (action: () => void, name: string) => {
        console.log(`🚀 Executing profile command: ${name}`);
        lastCommandTimeRef.current = Date.now();
        action();
      };

      console.log(`Profile voice command recognized (confidence: ${confidence.toFixed(2)}):`, transcript);
      onCommandRecognized?.(transcript);

      // Handle scroll commands with multiple variations
      const scrollDownKeywords = ['scroll down', 'scroll down page', 'go down', 'move down', 'page down'];
      const scrollUpKeywords = ['scroll up', 'scroll up page', 'go up', 'move up', 'page up'];

      // Check for scroll down commands
      if (scrollDownKeywords.some(keyword => transcript.includes(keyword))) {
        executeCommand(() => {
          console.log('Scrolling down...');
          speak('Scrolling down');
          const scrollAmount = window.innerHeight * 0.8;
          window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }, 'Scroll Down');
        return;
      }

      // Check for scroll up commands
      if (scrollUpKeywords.some(keyword => transcript.includes(keyword))) {
        executeCommand(() => {
          console.log('Scrolling up...');
          speak('Scrolling up');
          const scrollAmount = window.innerHeight * 0.8;
          window.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        }, 'Scroll Up');
        return;
      }

      // Check for matching commands
      // Priority: Check "open profile" commands first
      // Priority: Check "open profile" commands first
      const profileCommands = ['open profile', 'go to profile', 'show profile', 'profile', 'my profile', 'open my profile', 'go to my profile'];
      if (profileCommands.some(cmd => transcript.includes(cmd))) {
        const isOnProfilePage = typeof window !== 'undefined' && window.location.pathname === '/profile';

        executeCommand(() => {
          if (isOnProfilePage) {
            console.log('Switching to My Account section');
            speak('Opening my account');
            setActive(1);
          } else {
            console.log('Navigating to profile page');
            speak('Opening profile');
            router.push('/profile');
          }
        }, 'Open Profile');
        return;
      }

      // Handle base navigation commands
      if (transcript.includes('home')) {
        executeCommand(() => { speak('Opening home'); router.push('/'); }, 'Go Home');
        return;
      }
      if (transcript.includes('courses')) {
        executeCommand(() => { speak('Opening courses'); router.push('/courses'); }, 'Go Courses');
        return;
      }
      if (transcript.includes('about')) {
        executeCommand(() => { speak('Opening about'); router.push('/about'); }, 'Go About');
        return;
      }
      if (transcript.includes('faq')) {
        executeCommand(() => { speak('Opening faq'); router.push('/faq'); }, 'Go FAQ');
        return;
      }
      if (transcript.includes('policy')) {
        executeCommand(() => { speak('Opening policy'); router.push('/policy'); }, 'Go Policy');
        return;
      }

      // Check for other profile commands
      for (const cmd of PROFILE_COMMANDS) {
        const matched = cmd.keywords.some(keyword =>
          transcript.includes(keyword)
        );

        if (matched) {
          if (cmd.action === 'logout') {
            executeCommand(() => {
              console.log('Executing logout command');
              speak('Logging out');
              logoutHandler();
            }, 'Logout');
            break;
          } else if (cmd.action === 'admin') {
            executeCommand(() => {
              if (userRole === 'admin' || userRole === 'Admin') {
                console.log('Navigating to admin dashboard');
                speak('Opening admin dashboard');
                router.push('/admin');
              } else {
                console.log('Admin access denied');
                speak('Access denied');
              }
            }, 'Admin Dashboard');
            break;
          } else if (cmd.action === 'update-profile') {
            executeCommand(() => {
              const profileForm = document.querySelector('form') as HTMLFormElement;
              const fullNameInput = document.getElementById('fullName') as HTMLInputElement;
              if (profileForm && fullNameInput) {
                speak('Updating profile');
                profileForm.requestSubmit();
              }
            }, 'Update Profile');
            break;
          } else if (cmd.action === 'change-avatar') {
            executeCommand(() => {
              const avatarInput = document.getElementById('avatar') as HTMLInputElement;
              if (avatarInput) {
                speak('Opening avatar selector');
                avatarInput.click();
              }
            }, 'Change Avatar');
            break;
          } else if (cmd.action === 'update-password') {
            executeCommand(() => {
              const passwordForm = document.querySelector('form') as HTMLFormElement;
              const oldPasswordInput = document.getElementById('oldPassword') as HTMLInputElement;
              if (passwordForm && oldPasswordInput) {
                speak('Updating password');
                passwordForm.requestSubmit();
              }
            }, 'Update Password');
            break;
          } else if (typeof cmd.action === 'number') {
            executeCommand(() => {
              console.log(`Switching to tab ${cmd.action}`);
              let tabName = 'section';
              if (cmd.action === 1) tabName = 'my account';
              else if (cmd.action === 2) tabName = 'change password';
              else if (cmd.action === 3) tabName = 'enrolled courses';
              speak(`Opening ${tabName}`);
              setActive(cmd.action);
            }, `Switch Tab ${cmd.action}`);
            break;
          }
        }
      }
    };

    recognitionRef.current.onstart = () => {
      isStartingRef.current = false;
    };

    recognitionRef.current.onerror = (event: any) => {
      isStartingRef.current = false;

      // Ignore "aborted" errors as they're normal when stopping
      if (event.error === 'aborted') {
        return;
      }

      // Ignore "no-speech" errors silently
      if (event.error === 'no-speech') {
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }

        restartTimeoutRef.current = setTimeout(() => {
          if (isActive && recognitionRef.current) {
            safeStart();
          }
          restartTimeoutRef.current = null;
        }, 100);
        return;
      }

      console.error('Speech recognition error:', event.error);

      // Try to restart if still active
      if (isActive && recognitionRef.current) {
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }

        restartTimeoutRef.current = setTimeout(() => {
          if (isActive && recognitionRef.current) {
            safeStart();
          }
          restartTimeoutRef.current = null;
        }, 1000);
      }
    };

    recognitionRef.current.onend = () => {
      isStartingRef.current = false;

      // Restart listening if still active
      if (isActive && recognitionRef.current) {
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }

        restartTimeoutRef.current = setTimeout(() => {
          if (isActive && recognitionRef.current) {
            safeStart();
          }
          restartTimeoutRef.current = null;
        }, 100);
      }
    };

    // Start listening
    safeStart();

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors when stopping
        }
        recognitionRef.current = null;
      }

      isStartingRef.current = false;
    };
  }, [isActive, setActive, logoutHandler, userRole, router, onCommandRecognized, speak, isTTSActive]);
};

