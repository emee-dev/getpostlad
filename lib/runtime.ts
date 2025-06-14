import { expect } from "chai"

/**
 * Browser-compatible polyfill testing framework
 * Mirrors describe, it, and expect from Jest for collecting structured test results
 */

export type TestResult = {
  id: string;
  name: string;
  passed: boolean | null;
  error?: string;
  type: "describe" | "it";
  it?: TestResult[]; // only present on describes
};

// Global test results collection
let testResults: TestResult[] = [];
let currentDescribe: TestResult | null = null;
let isInDescribe = false;
let isInIt = false;

/**
 * Reset the test results collection
 */
export function resetTestResults(): void {
  testResults = [];
  currentDescribe = null;
  isInDescribe = false;
  isInIt = false;
}

/**
 * Get all collected test results
 */
export function getTestResults(): TestResult[] {
  return [...testResults];
}

/**
 * Generate a unique ID for test results
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Describe block implementation
 */
export function describe(name: string, fn: () => void): void {
  if (isInDescribe) {
    throw new Error('describe blocks cannot be nested');
  }

  const describeResult: TestResult = {
    id: generateId(),
    name,
    passed: null,
    type: "describe",
    it: []
  };

  // Set up describe context
  isInDescribe = true;
  currentDescribe = describeResult;
  
  try {
    // Execute the describe block
    fn();
    
    // If we have it blocks, determine passed status from them
    if (describeResult.it && describeResult.it.length > 0) {
      describeResult.passed = describeResult.it.every(test => test.passed === true);
    } else {
      // If no it blocks but no errors, consider it passed
      describeResult.passed = true;
    }
  } catch (error) {
    describeResult.passed = false;
    describeResult.error = error instanceof Error ? error.message : String(error);
  } finally {
    // Clean up describe context
    isInDescribe = false;
    currentDescribe = null;
    
    // Add to results
    testResults.push(describeResult);
  }
}

/**
 * It block implementation
 */
export function it(name: string, fn: () => void): void {
  if (isInIt) {
    throw new Error('it blocks cannot be nested');
  }

  const itResult: TestResult = {
    id: generateId(),
    name,
    passed: null,
    type: "it"
  };

  // Set up it context
  isInIt = true;
  
  try {
    // Execute the it block
    fn();
    itResult.passed = true;
  } catch (error) {
    itResult.passed = false;
    itResult.error = error instanceof Error ? error.message : String(error);
  } finally {
    // Clean up it context
    isInIt = false;
    
    // Add to appropriate collection
    if (currentDescribe && currentDescribe.it) {
      currentDescribe.it.push(itResult);
    } else {
      // Standalone it block
      testResults.push(itResult);
    }
  }
}