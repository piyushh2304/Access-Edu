// client/app/hooks/useVoiceFormFilling.ts
import { useEffect, useRef, useState, useCallback } from 'react';

// Minimum confidence score required for speech recognition (0.0 to 1.0)
// Higher values = more accurate but may reject valid commands
// Lower values = more lenient but may accept incorrect transcriptions
const MIN_CONFIDENCE_THRESHOLD = 0.5;

interface UseVoiceFormFillingProps {
  isActive: boolean;
  onFieldFilled?: (fieldId: string, value: string) => void;
  onCommandRecognized?: (command: string) => void;
}

interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
}

export const useVoiceFormFilling = ({
  isActive,
  onFieldFilled,
  onCommandRecognized,
}: UseVoiceFormFillingProps) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListeningForInput, setIsListeningForInput] = useState(false);
  const [currentFieldId, setCurrentFieldId] = useState<string | null>(null);
  const [isFillingActive, setIsFillingActive] = useState(false);

  // Field name mappings - maps voice commands to form field IDs
  const fieldMappings: Record<string, string[]> = {
    // Login/SignUp fields
    email: ['email', 'e-mail', 'mail'],
    password: ['password', 'pass', 'pwd'],
    name: ['name', 'full name', 'username', 'user name'],
    confirmPassword: ['confirm password', 'confirm pass', 'repeat password', 'retype password'],
    
    // Profile fields
    fullName: ['full name', 'name', 'your name'],
    fullAddress: ['address', 'full address', 'email address'],
    oldPassword: ['old password', 'current password', 'existing password'],
    newPassword: ['new password'],
    
    // Course fields
    search: ['search', 'search field', 'search box'],
    title: ['title', 'course title'],
    description: ['description', 'desc'],
  };

  // Get all form fields on the page
  const getFormFields = useCallback((): FormField[] => {
    const forms = document.querySelectorAll('form');
    const fields: FormField[] = [];

      forms.forEach((form) => {
        // Get all input elements
        const inputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
          'input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="number"], input[type="search"], textarea, select'
        );
        
        inputs.forEach((input) => {
          if (input.id && !input.disabled && !input.readOnly) {
            const label = form.querySelector(`label[for="${input.id}"]`);
            const labelText = label?.textContent?.toLowerCase().trim() || 
                             (input instanceof HTMLInputElement ? (input.name || input.placeholder) : '') || 
                             input.id;
            
            const inputType = input instanceof HTMLInputElement 
              ? input.type 
              : input instanceof HTMLTextAreaElement 
              ? 'textarea' 
              : 'select';
            
            fields.push({
              id: input.id,
              name: (input instanceof HTMLInputElement ? input.name : '') || input.id,
              type: inputType,
              label: labelText,
              element: input,
            });
          }
        });
      });

    return fields;
  }, []);

  // Find field by voice command
  const findFieldByCommand = useCallback((command: string): FormField | null => {
    const fields = getFormFields();
    const lowerCommand = command.toLowerCase().trim();

    // Direct field ID match
    const directMatch = fields.find(field => 
      field.id.toLowerCase() === lowerCommand || 
      field.name.toLowerCase() === lowerCommand
    );
    if (directMatch) return directMatch;

    // Field mapping match
    for (const [fieldId, keywords] of Object.entries(fieldMappings)) {
      if (keywords.some(keyword => lowerCommand.includes(keyword))) {
        const field = fields.find(f => f.id.toLowerCase().includes(fieldId) || f.name.toLowerCase().includes(fieldId));
        if (field) return field;
      }
    }

    // Label text match
    const labelMatch = fields.find(field => 
      field.label.toLowerCase().includes(lowerCommand) ||
      lowerCommand.includes(field.label.toLowerCase())
    );
    if (labelMatch) return labelMatch;

    return null;
  }, [getFormFields]);

  // Fill a field with value
  const fillField = useCallback((field: FormField, value: string) => {
    if (!field.element) {
      console.error('Field element is null');
      return;
    }

    // Get field name for React (Formik uses this)
    const fieldName = (field.element instanceof HTMLInputElement || 
                      field.element instanceof HTMLTextAreaElement || 
                      field.element instanceof HTMLSelectElement)
      ? (field.element.name || field.id)
      : field.id;

    console.log(`Attempting to fill field: ${field.id} (name: ${fieldName}) with value: ${value}`);

    // Method 1: Directly trigger React onChange handler (Best for Formik)
    // Create a proper React synthetic event structure
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: value,
        id: field.id,
        type: field.type || 'text',
        // Ensure these properties exist for React
        nodeName: field.element.nodeName,
        ownerDocument: field.element.ownerDocument,
      },
      currentTarget: field.element,
      nativeEvent: new Event('change', { bubbles: true }),
      persist: () => {},
      preventDefault: () => {},
      stopPropagation: () => {},
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      timeStamp: Date.now(),
      type: 'change',
    };

    // Try to find and call the onChange handler directly
    // React 18+ uses different internal structures
    const possibleKeys = [
      '__reactProps$',
      '__reactFiber$',
      '__reactInternalInstance$',
      '__reactInternalFiber$',
      '__reactEventHandlers$',
      '__reactProps',
      '__reactFiber',
      '__reactInternalInstance',
      '__reactInternalFiber',
    ];

    for (const keyPattern of possibleKeys) {
      const key = Object.keys(field.element).find(k => k.startsWith(keyPattern));
      if (key) {
        const reactData = (field.element as any)[key];
        
        // Try memoizedProps (React 16+)
        if (reactData?.memoizedProps?.onChange) {
          try {
            console.log(`Calling onChange via memoizedProps for ${field.id}`);
            reactData.memoizedProps.onChange(syntheticEvent);
            onFieldFilled?.(field.id, value);
            console.log(`✅ Successfully filled field "${field.label}" via memoizedProps`);
            return;
          } catch (e) {
            console.warn('Error calling memoizedProps.onChange:', e);
          }
        }
        
        // Try props directly
        if (reactData?.props?.onChange) {
          try {
            console.log(`Calling onChange via props for ${field.id}`);
            reactData.props.onChange(syntheticEvent);
            onFieldFilled?.(field.id, value);
            console.log(`✅ Successfully filled field "${field.label}" via props`);
            return;
          } catch (e) {
            console.warn('Error calling props.onChange:', e);
          }
        }

        // Try stateNode (for class components)
        if (reactData?.stateNode?.props?.onChange) {
          try {
            reactData.stateNode.props.onChange(syntheticEvent);
            onFieldFilled?.(field.id, value);
            console.log(`✅ Successfully filled field "${field.label}" via stateNode`);
            return;
          } catch (e) {
            console.warn('Error calling stateNode.props.onChange:', e);
          }
        }
      }
    }

    // Method 2: Set value directly and trigger React change event (Works with Formik)
    // First, set the actual value on the element using the native setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set || Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set || Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype,
      'value'
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(field.element, value);
    } else {
      (field.element as any).value = value;
    }

    // Ensure the name attribute is set (Formik uses this)
    if (fieldName && !(field.element as any).name) {
      (field.element as any).setAttribute('name', fieldName);
    }

    // Method 2a: Create a native Event that React/Formik will capture
    // This is the most reliable method for Formik
    const createReactCompatibleEvent = (type: 'input' | 'change') => {
      const event = new Event(type, { 
        bubbles: true, 
        cancelable: true,
        composed: true 
      }) as any;

      // Create a target object that has all the properties Formik expects
      const targetProperties = {
        name: fieldName,
        value: value,
        id: field.id,
        type: field.type || 'text',
        checked: field.type === 'checkbox' ? Boolean(value) : undefined,
      };

      // Merge target properties with the actual element
      const eventTarget = Object.assign(field.element, targetProperties);

      // Define target as non-writable but return our merged object
      Object.defineProperty(event, 'target', {
        value: eventTarget,
        writable: false,
        enumerable: true,
      });

      Object.defineProperty(event, 'currentTarget', {
        value: field.element,
        writable: false,
        enumerable: true,
      });

      return event;
    };

    // Dispatch input event first (React listens to this)
    const inputEvent = createReactCompatibleEvent('input');
    field.element.dispatchEvent(inputEvent);

    // Small delay to ensure React processes the input event
    setTimeout(() => {
      // Dispatch change event (Formik specifically listens to this)
      const changeEvent = createReactCompatibleEvent('change');
      field.element.dispatchEvent(changeEvent);

      // Trigger a blur event to ensure Formik validates if needed
      setTimeout(() => {
        const blurEvent = new FocusEvent('blur', { bubbles: true, cancelable: true });
        field.element.dispatchEvent(blurEvent);
      }, 10);
    }, 10);

    onFieldFilled?.(field.id, value);
    console.log(`✅ Voice filled field "${field.label}" (${field.id}) with: ${value} - using native change events`);
  }, [onFieldFilled]);

  // Focus on a field
  const focusField = useCallback((field: FormField) => {
    field.element.focus();
    field.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setCurrentFieldId(field.id);
    setIsListeningForInput(true);
    console.log(`Focused on field: ${field.label} (${field.id})`);
  }, []);

  // Navigate to next/previous field
  const navigateFields = useCallback((direction: 'next' | 'previous') => {
    const fields = getFormFields();
    if (fields.length === 0) return;

    const currentIndex = currentFieldId 
      ? fields.findIndex(f => f.id === currentFieldId)
      : -1;

    let targetIndex: number;
    if (direction === 'next') {
      targetIndex = currentIndex < fields.length - 1 ? currentIndex + 1 : 0;
    } else {
      targetIndex = currentIndex > 0 ? currentIndex - 1 : fields.length - 1;
    }

    const targetField = fields[targetIndex];
    if (targetField) {
      focusField(targetField);
    }
  }, [currentFieldId, getFormFields, focusField]);

  // Submit current form
  const submitForm = useCallback(() => {
    const fields = getFormFields();
    if (fields.length === 0) return;

    const currentForm = currentFieldId 
      ? fields.find(f => f.id === currentFieldId)?.element.closest('form')
      : document.querySelector('form');

    if (currentForm) {
      const submitButton = currentForm.querySelector<HTMLButtonElement | HTMLInputElement>('button[type="submit"], input[type="submit"]');
      if (submitButton) {
        submitButton.click();
        console.log('Form submitted via voice command');
      } else {
        currentForm.requestSubmit();
      }
      setIsListeningForInput(false);
      setCurrentFieldId(null);
    }
  }, [currentFieldId, getFormFields]);

  // Listen for form activation events
  useEffect(() => {
    const handleActivateFormFilling = () => {
      if (!isActive) return;
      
      console.log('Auto-activating form filling...');
      setIsFillingActive(true);
      
      // Wait a bit for form to render, then focus first field
      setTimeout(() => {
        const fields = getFormFields();
        if (fields.length > 0) {
          const firstField = fields[0];
          focusField(firstField);
          console.log(`Auto-focused on first field: ${firstField.label} (${firstField.id})`);
        }
      }, 300);
    };

    window.addEventListener('voice-activate-form-filling', handleActivateFormFilling);

    return () => {
      window.removeEventListener('voice-activate-form-filling', handleActivateFormFilling);
    };
  }, [isActive, getFormFields, focusField]);

  useEffect(() => {
    if (!isActive) {
      setIsListeningForInput(false);
      setCurrentFieldId(null);
      setIsFillingActive(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      console.warn('Web Speech API is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      // Get the most recent result with confidence score
      const results = Array.from(event.results);
      const lastResult = results[results.length - 1];
      const lastAlternative = lastResult[0];
      
      // Check confidence score - only process if confidence meets threshold
      const confidence = lastAlternative?.confidence ?? 0;
      if (confidence < MIN_CONFIDENCE_THRESHOLD) {
        console.log(`⚠️ Low confidence result ignored (${confidence.toFixed(2)} < ${MIN_CONFIDENCE_THRESHOLD}): "${lastAlternative?.transcript}"`);
        return;
      }
      
      // Get transcript from the most confident result
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .filter((result) => (result.confidence ?? 0) >= MIN_CONFIDENCE_THRESHOLD) // Filter low confidence results
        .map((result) => result.transcript)
        .join('')
        .toLowerCase()
        .trim();

      console.log(`Voice form filling command (confidence: ${confidence.toFixed(2)}):`, transcript);
      onCommandRecognized?.(transcript);

      // If listening for input to fill a field
      if (isListeningForInput && currentFieldId) {
        const fields = getFormFields();
        const currentField = fields.find(f => f.id === currentFieldId);
        
        if (currentField) {
          // Check for special commands
          if (transcript.includes('cancel') || transcript.includes('clear') || transcript.includes('delete') || transcript.includes('stop')) {
            fillField(currentField, '');
            setIsListeningForInput(false);
            setCurrentFieldId(null);
            console.log('Cancelled field input');
            return;
          }

          if (transcript.includes('next') || transcript.includes('skip')) {
            setIsListeningForInput(false);
            setCurrentFieldId(null);
            navigateFields('next');
            return;
          }

          if (transcript.includes('submit') || transcript.includes('send') || transcript.includes('done') || transcript.includes('finish')) {
            setIsListeningForInput(false);
            setCurrentFieldId(null);
            submitForm();
            return;
          }

          // Fill the field with the transcript (remove command words if present)
          const cleanedTranscript = transcript
            .replace(/\b(fill|enter|type|input|with|value)\b/gi, '')
            .trim();
          
          if (cleanedTranscript) {
            fillField(currentField, cleanedTranscript);
            setIsListeningForInput(false);
            setCurrentFieldId(null);
            console.log(`✅ Filled field ${currentField.id} with: ${cleanedTranscript}`);
            
            // Auto-advance to next field after a short delay
            setTimeout(() => {
              navigateFields('next');
            }, 800);
          }
        }
        return;
      }

      // Handle field navigation commands (when not listening for input)
      const fillKeywords = ['fill', 'enter', 'type', 'input', 'go to', 'focus', 'select', 'set'];
      const nextKeywords = ['next field', 'next input', 'next', 'tab', 'skip'];
      const previousKeywords = ['previous field', 'previous input', 'previous', 'back', 'shift tab', 'go back'];
      const submitKeywords = ['submit', 'send form', 'submit form', 'done', 'finish', 'send'];

      // Submit command (highest priority)
      if (submitKeywords.some(keyword => transcript.includes(keyword))) {
        console.log('Voice command: Submit form');
        submitForm();
        return;
      }

      // Next field command
      if (nextKeywords.some(keyword => transcript.includes(keyword))) {
        console.log('Voice command: Next field');
        navigateFields('next');
        return;
      }

      // Previous field command
      if (previousKeywords.some(keyword => transcript.includes(keyword))) {
        console.log('Voice command: Previous field');
        navigateFields('previous');
        return;
      }

      // Fill field command with value (e.g., "fill email with test@example.com")
      const fillWithPattern = /(?:fill|enter|type|input|set)\s+(\w+)\s+(?:with|to|as)\s+(.+)/i;
      const fillWithMatch = transcript.match(fillWithPattern);
      if (fillWithMatch) {
        const fieldName = fillWithMatch[1].trim();
        const fieldValue = fillWithMatch[2].trim();
        const targetField = findFieldByCommand(fieldName);
        
        if (targetField) {
          console.log(`Voice command: Fill ${fieldName} with ${fieldValue}`);
          fillField(targetField, fieldValue);
          return;
        }
      }

      // Fill field command (just focusing, will listen for value)
      if (fillKeywords.some(keyword => transcript.includes(keyword))) {
        setIsFillingActive(true);
        
        // Extract field name from command
        const fieldCommand = transcript.replace(/(fill|enter|type|input|go to|focus|select|set)/gi, '').trim();
        const targetField = findFieldByCommand(fieldCommand);
        
        if (targetField) {
          console.log(`Voice command: Focus on ${targetField.label} (${targetField.id})`);
          focusField(targetField);
        } else {
          console.warn(`⚠️ Field not found for command: "${fieldCommand}"`);
          console.log('Available fields:', getFormFields().map(f => ({ id: f.id, name: f.name, label: f.label })));
        }
        return;
      }

      // Direct field name (without fill keyword) - also try to find value
      // Check if it looks like "fieldname value" (e.g., "email test@example.com")
      const words = transcript.split(/\s+/);
      if (words.length >= 2) {
        const possibleField = findFieldByCommand(words[0]);
        if (possibleField) {
          const value = words.slice(1).join(' ');
          console.log(`Voice command: Direct fill ${possibleField.id} with ${value}`);
          fillField(possibleField, value);
          return;
        }
      }

      // Direct field name (just focusing)
      const directField = findFieldByCommand(transcript);
      if (directField) {
        console.log(`Voice command: Direct focus on ${directField.label} (${directField.id})`);
        setIsFillingActive(true);
        focusField(directField);
      } else {
        console.log(`⚠️ Command not recognized: "${transcript}"`);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Voice form filling error:', event.error);
      if (event.error === 'no-speech') {
        // Restart if no speech detected
        setTimeout(() => {
          if (isActive && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error('Error restarting speech recognition:', error);
            }
          }
        }, 1000);
      }
    };

    recognitionRef.current.onend = () => {
      if (isActive) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (error) {
            console.error('Error restarting speech recognition:', error);
          }
        }, 500);
      }
    };

    if (isActive) {
      try {
        recognitionRef.current.start();
        setIsFillingActive(true);
      } catch (error) {
        console.error('Error starting voice form filling:', error);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListeningForInput(false);
      setCurrentFieldId(null);
      setIsFillingActive(false);
    };
  }, [
    isActive,
    isListeningForInput,
    currentFieldId,
    onCommandRecognized,
    getFormFields,
    findFieldByCommand,
    focusField,
    fillField,
    navigateFields,
    submitForm,
  ]);

  return {
    isFillingActive,
    isListeningForInput,
    currentFieldId,
  };
};



