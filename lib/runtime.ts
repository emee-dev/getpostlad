import { expect } from "chai";
import { deserializeHttpFn } from "./utils";

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

/**
 * Execute user-defined test scripts in a sandboxed environment
 * @param src - Function containing test code to execute
 * @returns Array of TestResult objects
 */
export function scriptRuntime(functionBody: string): TestResult[] {
  try {
    // Create a sandboxed execution environment
    const sandboxedFunction = new Function(
      "expect",
      `
      let testResults = [];
      let currentDescribe = null;
      let isInDescribe = false;
      let isInIt = false;

      function generateId() {
        return crypto.randomUUID();
      }

      function resetTestResults() {
        testResults = [];
        currentDescribe = null;
        isInDescribe = false;
        isInIt = false;
      }

      function getTestResults() {
        return [...testResults];
      }

      function describe(name, fn) {
        if (isInDescribe) {
          throw new Error('describe blocks cannot be nested');
        }

        const describeResult = {
          id: generateId(),
          name,
          passed: null,
          type: "describe",
          it: []
        };

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
          isInDescribe = false;
          currentDescribe = null;
          
          // Add to results
          testResults.push(describeResult);
        }
      }

      function it(name, fn) {
        if (isInIt) {
          throw new Error('it blocks cannot be nested');
        }

        const itResult = {
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

      resetTestResults();

      // Execute the user's test code
      ${functionBody}

      // Return the collected results
      return getTestResults();
    `
    );

    // Execute the sandboxed function and return results
    return sandboxedFunction(expect);
  } catch (error) {
    console.log("Script Execution Error");
    return [];
  }
}