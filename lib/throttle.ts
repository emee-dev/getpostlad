/**
 * Creates a throttled version of a function that limits how often it can be called
 * @param func - The function to throttle
 * @param delay - The minimum delay between function calls in milliseconds
 * @returns A throttled version of the function with cleanup capability
 */
export function createThrottle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime = 0;

  const throttledFunction = ((...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;

    // If enough time has passed since the last call, execute immediately
    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      func(...args);
      return;
    }

    // Otherwise, schedule the function to run after the remaining delay
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const remainingDelay = delay - (now - lastCallTime);
    timeoutId = setTimeout(() => {
      if (lastArgs) {
        lastCallTime = Date.now();
        func(...lastArgs);
        timeoutId = null;
        lastArgs = null;
      }
    }, remainingDelay);
  }) as T & { cancel: () => void };

  // Add cancel method to clean up pending timeouts
  throttledFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return throttledFunction;
}

/**
 * Custom hook that creates a throttled value that updates at most once per delay period
 * @param value - The value to throttle
 * @param delay - The minimum delay between updates in milliseconds
 * @returns The throttled value
 */
export function useThrottledValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const throttledSetterRef = React.useRef<((value: T) => void) & { cancel: () => void }>();

  // Create throttled setter on mount or when delay changes
  React.useEffect(() => {
    // Clean up previous throttled function
    if (throttledSetterRef.current) {
      throttledSetterRef.current.cancel();
    }

    // Create new throttled setter
    throttledSetterRef.current = createThrottle((newValue: T) => {
      setThrottledValue(newValue);
    }, delay);

    return () => {
      if (throttledSetterRef.current) {
        throttledSetterRef.current.cancel();
      }
    };
  }, [delay]);

  // Update throttled value when input value changes
  React.useEffect(() => {
    if (throttledSetterRef.current) {
      throttledSetterRef.current(value);
    }
  }, [value]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (throttledSetterRef.current) {
        throttledSetterRef.current.cancel();
      }
    };
  }, []);

  return throttledValue;
}

// Re-export React for the hook
import * as React from 'react';