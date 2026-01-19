// client/app/hooks/useVoiceNavigation.ts
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

// Minimum confidence score required for speech recognition (0.0 to 1.0)
// Higher values = more accurate but may reject valid commands
// Lower values = more lenient but may accept incorrect transcriptions
const MIN_CONFIDENCE_THRESHOLD = 0.3;

interface VoiceCommand {
  command: string;
  path: string;
}

const NAVIGATION_COMMANDS: VoiceCommand[] = [
  { command: 'open home', path: '/' },
  { command: 'go home', path: '/' },
  { command: 'home', path: '/' },
  { command: 'open courses', path: '/courses' },
  { command: 'go to courses', path: '/courses' },
  { command: 'courses', path: '/courses' },
  { command: 'open about', path: '/about' },
  { command: 'go to about', path: '/about' },
  { command: 'about', path: '/about' },
  { command: 'open faq', path: '/faq' },
  { command: 'go to faq', path: '/faq' },
  { command: 'faq', path: '/faq' },
  { command: 'open policy', path: '/policy' },
  { command: 'go to policy', path: '/policy' },
  { command: 'policy', path: '/policy' },
  { command: 'open profile', path: '/profile' },
  { command: 'go to profile', path: '/profile' },
  { command: 'show profile', path: '/profile' },
  { command: 'profile', path: '/profile' },
  { command: 'my profile', path: '/profile' },
  { command: 'open my profile', path: '/profile' },
  { command: 'go to my profile', path: '/profile' },
  { command: 'open admin', path: '/admin' },
  { command: 'go to admin', path: '/admin' },
  { command: 'admin', path: '/admin' },
  { command: 'change password', path: '/profile?action=change-password' }, // Example for specific action
];

interface UseVoiceNavigationProps {
  isActive: boolean;
  onCommandRecognized?: (command: string) => void;
  onListeningStatusChange?: (isListening: boolean) => void;
  speak?: (text: string, options?: any) => void;
  isTTSActive?: boolean;
}

export const useVoiceNavigation = ({
  isActive,
  onCommandRecognized,
  onListeningStatusChange,
  speak: providedSpeak,
  isTTSActive: providedIsTTSActive,
}: UseVoiceNavigationProps) => {
  const router = useRouter();
  const pathname = usePathname(); // Track route changes
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const permissionDeniedRef = useRef(false);
  const isStartingRef = useRef(false);
  const lastPathnameRef = useRef<string | null>(null);
  const lastCommandTimeRef = useRef<number>(0);
  const PROCESSING_COOLDOWN = 1000; // ms to wait before processing another command

  // Use provided values directly
  // When called from SpeechProvider, speak and isTTSActive are provided to avoid circular dependency
  // When called from other components, they can optionally use useSpeech hook before calling this
  const actualSpeak = providedSpeak;
  const actualIsTTSActive = providedIsTTSActive ?? true;

  // Detect route changes and restart recognition (separate useEffect)
  useEffect(() => {
    if (pathname !== lastPathnameRef.current && isActive) {
      const previousPathname = lastPathnameRef.current;
      lastPathnameRef.current = pathname;

      // Route changed, ensure recognition restarts after page loads
      if (previousPathname !== null) { // Don't restart on initial load
        console.log(`📍 Route changed from ${previousPathname} to ${pathname}, restarting voice recognition...`);
      }

      setTimeout(() => {
        if (isActive && recognitionRef.current) {
          try {
            const state = (recognitionRef.current as any).state;
            if (!state || state === 'idle' || state === 'stopped') {
              // Use a function to safely start
              if (recognitionRef.current && isActive) {
                try {
                  recognitionRef.current.start();
                  console.log('✅ Voice recognition restarted after route change');
                } catch (error: any) {
                  if (error.name !== 'InvalidStateError' && !error.message?.includes('already started')) {
                    console.error("Error restarting speech recognition after route change:", error);
                  }
                }
              }
            } else if (state === 'listening' || state === 'starting') {
              console.log('✅ Voice recognition already active on new page');
            }
          } catch (e) {
            // If we can't check state, just try to start
            if (recognitionRef.current && isActive) {
              try {
                recognitionRef.current.start();
                console.log('✅ Voice recognition restarted after route change (fallback)');
              } catch (error: any) {
                // Ignore errors
              }
            }
          }
        }
      }, 100); // Very short delay for faster restart
    }
  }, [pathname, isActive]);

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
      setIsListening(false);
      return;
    }

    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      console.warn('Web Speech API is not supported in this browser.');
      return;
    }

    // Type definition for window with SpeechRecognition
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
    recognitionRef.current.continuous = true; // Listen continuously for better scroll command handling
    recognitionRef.current.interimResults = true; // Enable interim results for faster response
    recognitionRef.current.lang = 'en-US'; // Set language

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
          console.error("Error starting speech recognition:", error);
        }
        isStartingRef.current = false;
      }
    };

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      isStartingRef.current = false;
      onListeningStatusChange?.(true);
      console.log('Voice navigation listening started...');
    };

    recognitionRef.current.onerror = (event) => {
      isStartingRef.current = false;

      // Ignore "aborted" errors as they're normal when stopping
      if (event.error === 'aborted') {
        return;
      }

      // Handle permission denied error
      if (event.error === 'not-allowed') {
        // Only show toast once
        if (!permissionDeniedRef.current) {
          toast.error('Microphone permission denied. Please allow microphone access to use voice commands.');
          permissionDeniedRef.current = true;
        }
        setIsListening(false);
        onListeningStatusChange?.(false);
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
        }, 1000);
        return;
      }

      console.error('Speech recognition error:', event.error);

      // Generic error toast for other errors
      if (event.error !== 'no-speech' && event.error !== 'not-allowed') {
        // toast.error(`Voice error: ${event.error}`); 
      }

      setIsListening(false);
      onListeningStatusChange?.(false);

      if (isActive && recognitionRef.current) {
        // Attempt to restart on error if still active and NOT a permission issue
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
      setIsListening(false);
      isStartingRef.current = false;
      onListeningStatusChange?.(false);
      console.log('Voice navigation listening stopped.');

      // STOP RESTARTING IF PERMISSION DENIED
      if (permissionDeniedRef.current) {
        return;
      }

      if (isActive && recognitionRef.current) {
        // Clear any pending restart
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }

        // If still active, restart listening after a short delay
        restartTimeoutRef.current = setTimeout(() => {
          if (isActive && recognitionRef.current) {
            safeStart();
          }
          restartTimeoutRef.current = null;
        }, 500);
      }
    };

    recognitionRef.current.onresult = (event) => {
      // Prevent processing if we just executed a command
      if (Date.now() - lastCommandTimeRef.current < PROCESSING_COOLDOWN) {
        return;
      }

      // Get the most recent result (can be interim or final)
      const results = Array.from(event.results);
      const lastResult = results[results.length - 1];
      const lastAlternative = lastResult[0];

      // Check confidence score - only process if confidence meets threshold
      const confidence = lastAlternative?.confidence ?? 0;
      // For interim results, confidence might be 0 or low, but if the match is perfect for a command, we might want to take it.
      // However, to be safe, we'll keep a threshold but maybe lower it or trust strictly matching commands more.

      // Get transcript from the most confident result or the latest interim
      const transcript = lastAlternative?.transcript || '';

      // If empty, ignore
      const lowerTranscript = transcript.toLowerCase().trim();
      console.log(`🎤 Voice input (interim: ${!lastResult.isFinal}):`, transcript);
      console.log(`🎤 [DEBUG] Lowercase Transcript: "${lowerTranscript}"`);

      // EXECUTION HELPER: Updates time and prevents double-fire
      const executeCommand = (action: () => void, commandName: string) => {
        console.log(`🚀 Executing command: ${commandName}`);
        lastCommandTimeRef.current = Date.now();
        action();

        // Optionally abort/restart to clear buffer, but continuous=true usually handles it.
        // For navigation, the page will unload anyway.
      };

      // Handle scroll commands FIRST (before other commands to avoid conflicts)
      // Use more specific matching with word boundaries

      // Scroll to top commands - check full phrases first
      if (/^(scroll\s+to\s+top|go\s+to\s+top|top\s+of\s+page|scroll\s+top)$/i.test(lowerTranscript) ||
        /\b(scroll\s+to\s+top|go\s+to\s+top|top\s+of\s+page)\b/i.test(lowerTranscript)) {
        executeCommand(() => {
          console.log('Scrolling to top...');
          if (actualSpeak) actualSpeak('Scrolling to top'); // Shortened
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 'Scroll Top');
        return;
      }

      // Scroll to bottom commands - check full phrases first
      if (/^(scroll\s+to\s+bottom|go\s+to\s+bottom|bottom\s+of\s+page|scroll\s+bottom)$/i.test(lowerTranscript) ||
        /\b(scroll\s+to\s+bottom|go\s+to\s+bottom|bottom\s+of\s+page)\b/i.test(lowerTranscript)) {
        executeCommand(() => {
          console.log('Scrolling to bottom...');
          if (actualSpeak) actualSpeak('Scrolling to bottom');
          const maxScroll = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight,
            document.documentElement.clientHeight
          );
          window.scrollTo({ top: maxScroll, behavior: 'smooth' });
        }, 'Scroll Bottom');
        return;
      }

      // Scroll down commands - use word boundary matching
      if (/\b(scroll\s+down|go\s+down|move\s+down|page\s+down|scroll\s+down\s+page)\b/i.test(lowerTranscript)) {
        executeCommand(() => {
          console.log('Scrolling down...');
          if (actualSpeak) actualSpeak('Scrolling down');
          const scrollAmount = window.innerHeight * 0.8;
          window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }, 'Scroll Down');
        return;
      }

      // Scroll up commands - use word boundary matching
      if (/\b(scroll\s+up|go\s+up|move\s+up|page\s+up|scroll\s+up\s+page)\b/i.test(lowerTranscript)) {
        executeCommand(() => {
          console.log('Scrolling up...');
          if (actualSpeak) actualSpeak('Scrolling up');
          const scrollAmount = window.innerHeight * 0.8;
          window.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        }, 'Scroll Up');
        return;
      }

      // Navigation command map
      const pageMap: Record<string, string> = {
        'home': '/',
        'about': '/about',
        'courses': '/courses',
        'faq': '/faq',
        'policy': '/policy',
        'profile': '/profile',
        'admin': '/admin',
      };

      // Helper function to navigate
      const navigateToPage = (pageName: string) => {
        const normalizedPageName = pageName.toLowerCase().trim();
        const path = pageMap[normalizedPageName];

        if (!path) {
          // console.warn(`⚠️ No path found for page name: "${pageName}"`);
          return false;
        }

        const currentPath = pathname || '/';

        // Don't navigate if already on the page
        if (path === currentPath) {
          console.log(`ℹ️ Already on ${normalizedPageName} page (${path})`);
          executeCommand(() => {
            if (actualSpeak) actualSpeak(`You are already on the ${normalizedPageName} page`);
          }, `Already on ${normalizedPageName}`);
          return true;
        }

        executeCommand(() => {
          console.log(`📍 Navigating from "${currentPath}" to "${normalizedPageName}" (${path})...`);
          if (actualSpeak) actualSpeak(`Opening ${normalizedPageName}`);
          // Immediate navigation
          router.push(path);
        }, `Navigate to ${normalizedPageName}`);

        return true;
      };

      // Check for login/signup commands (after scroll commands)
      // Use regex for more robust matching of login/signup commands
      const loginPattern = /\b(login|log\s+in|sign\s+in|signin)\b/i;
      const signupPattern = /\b(sign\s+up|signup|register|create\s+account|new\s+account|join)\b/i;

      if (loginPattern.test(lowerTranscript)) {
        console.log('🎤 [DEBUG] MATCHED LOGIN PATTERN:', lowerTranscript);
        executeCommand(() => {
          console.log('🎤 Opening login form via voice command');
          if (actualSpeak) actualSpeak('Opening login');
          toast.success('Voice Command: Opening Login');
          const event = new CustomEvent('voice-open-form', { detail: { formType: 'login' } });
          window.dispatchEvent(event);
          console.log('🎤 [DEBUG] Dispatched voice-open-form (login)', event);
        }, 'Open Login');
        return;
      }


      if (signupPattern.test(lowerTranscript)) {
        executeCommand(() => {
          console.log('🎤 Opening signup form via voice command');
          if (actualSpeak) actualSpeak('Opening sign up');
          toast.success('Voice Command: Opening Sign Up');
          window.dispatchEvent(new CustomEvent('voice-open-form', { detail: { formType: 'signup' } }));
        }, 'Open Signup');
        return;
      }

      // Handle navigation commands - check variations systematically

      // 1. "open [page]" format
      const openPageMatch = lowerTranscript.match(/^open\s+(?:the\s+)?(home|about|courses|faq|policy|profile|admin)(?:\s+page)?$/i);
      if (openPageMatch) {
        if (navigateToPage(openPageMatch[1])) return;
      }

      // 2. "go to [page]" or "go [page]" format
      const goToPageMatch = lowerTranscript.match(/^go\s+(?:to\s+)?(home|about|courses|faq|policy|profile|admin)$/i);
      if (goToPageMatch) {
        if (navigateToPage(goToPageMatch[1])) return;
      }

      // 3. "show [page]" format
      const showPageMatch = lowerTranscript.match(/^show\s+(?:the\s+)?(home|about|courses|faq|policy|profile|admin)(?:\s+page)?$/i);
      if (showPageMatch) {
        if (navigateToPage(showPageMatch[1])) return;
      }

      // 4. Direct page names (exact matches only to avoid conflicts with other commands)
      // Only match if it's a standalone word to avoid false positives
      const directPageNames = ['home', 'courses', 'about', 'faq', 'policy', 'profile', 'admin'];
      const trimmedTranscript = lowerTranscript.trim();
      if (directPageNames.includes(trimmedTranscript) && trimmedTranscript.length > 0) {
        console.log(`📍 Direct page name match: "${trimmedTranscript}"`);
        if (navigateToPage(trimmedTranscript)) return;
      }

      // 5. "open [page]" with word boundary (for partial matches in longer phrases)
      const openPagePattern = /\bopen\s+(?:the\s+)?(home|about|courses|faq|policy|profile|admin)(?:\s+page)?\b/i;
      const openMatch = lowerTranscript.match(openPagePattern);
      if (openMatch) {
        if (navigateToPage(openMatch[1])) return;
      }

      // 6. "go to [page]" with word boundary
      const goToPattern = /\bgo\s+(?:to\s+)?(home|about|courses|faq|policy|profile|admin)\b/i;
      const goToMatch = lowerTranscript.match(goToPattern);
      if (goToMatch) {
        if (navigateToPage(goToMatch[1])) return;
      }

      // 7. Handle profile-specific commands
      if (/\b(open\s+)?(?:my\s+)?profile\b/i.test(lowerTranscript) && !/\badmin/i.test(lowerTranscript)) {
        if (navigateToPage('profile')) return;
      }

      // 8. Fallback: Check NAVIGATION_COMMANDS array for any remaining matches
      // This ensures backward compatibility and catches any commands we might have missed
      for (const cmd of NAVIGATION_COMMANDS) {
        // Check for exact match first (most reliable)
        if (lowerTranscript === cmd.command.toLowerCase().trim()) {
          console.log(`📍 Exact match found: "${cmd.command}" -> ${cmd.path}`);
          const pageName = cmd.command.split(' ').pop()?.toLowerCase() || '';
          if (navigateToPage(pageName)) {
            return;
          }
        }

        // Check if transcript includes the command (less reliable but catches variations)
        const cmdWords = cmd.command.toLowerCase().split(' ');
        const transcriptWords = lowerTranscript.split(' ');

        // Check if all words in the command are present in the transcript
        if (cmdWords.every(word => transcriptWords.some(tw => tw.includes(word) || word.includes(tw)))) {
          const pageName = cmdWords[cmdWords.length - 1]; // Get last word (the page name)
          if (pageMap[pageName] && navigateToPage(pageName)) {
            console.log(`📍 Partial match found: "${cmd.command}" -> ${cmd.path}`);
            return;
          }
        }
      }

      // Log if no command matched
      console.log(`⚠️ No navigation command matched for: "${transcript}"`);
    };

    if (isActive) {
      safeStart();
    }

    // Ensure recognition restarts after route changes
    const handleRouteChange = () => {
      if (isActive && recognitionRef.current) {
        // Small delay to ensure page has loaded
        setTimeout(() => {
          if (isActive) {
            safeStart();
          }
        }, 500);
      }
    };

    // Listen for route changes (Next.js App Router)
    if (typeof window !== 'undefined') {
      // Use a custom event or check for navigation
      window.addEventListener('popstate', handleRouteChange);

      // Also check periodically if recognition stopped (as a fallback)
      const checkInterval = setInterval(() => {
        if (isActive && recognitionRef.current) {
          try {
            const state = (recognitionRef.current as any).state;
            if (state === 'idle' || state === 'stopped') {
              safeStart();
            }
          } catch (e) {
            // Ignore errors
          }
        }
      }, 2000);

      return () => {
        window.removeEventListener('popstate', handleRouteChange);
        clearInterval(checkInterval);

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
    } else {
      // Fallback cleanup if window is not available
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
    }
  }, [isActive, router, pathname, onCommandRecognized, onListeningStatusChange, actualSpeak, actualIsTTSActive]);

  return { isListening };
};
