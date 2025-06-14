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
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

/**
 * Simple assertion class for expect functionality
 */
class Assertion {
  private value: any;
  private negated: boolean = false;

  constructor(value: any) {
    this.value = value;
  }

  get not(): Assertion {
    const assertion = new Assertion(this.value);
    assertion.negated = !this.negated;
    return assertion;
  }

  get to(): Assertion {
    return this;
  }

  get be(): Assertion {
    return this;
  }

  equal(expected: any): void {
    const passed = this.negated ? this.value !== expected : this.value === expected;
    if (!passed) {
      const message = this.negated 
        ? `Expected ${this.value} not to equal ${expected}`
        : `Expected ${this.value} to equal ${expected}`;
      throw new Error(message);
    }
  }

  strictEqual(expected: any): void {
    const passed = this.negated ? this.value !== expected : this.value === expected;
    if (!passed) {
      const message = this.negated 
        ? `Expected ${this.value} not to strictly equal ${expected}`
        : `Expected ${this.value} to strictly equal ${expected}`;
      throw new Error(message);
    }
  }

  greaterThan(expected: number): void {
    const passed = this.negated ? this.value <= expected : this.value > expected;
    if (!passed) {
      const message = this.negated 
        ? `Expected ${this.value} not to be greater than ${expected}`
        : `Expected ${this.value} to be greater than ${expected}`;
      throw new Error(message);
    }
  }

  lessThan(expected: number): void {
    const passed = this.negated ? this.value >= expected : this.value < expected;
    if (!passed) {
      const message = this.negated 
        ? `Expected ${this.value} not to be less than ${expected}`
        : `Expected ${this.value} to be less than ${expected}`;
      throw new Error(message);
    }
  }

  greaterThanOrEqual(expected: number): void {
    const passed = this.negated ? this.value < expected : this.value >= expected;
    if (!passed) {
      const message = this.negated 
        ? `Expected ${this.value} not to be greater than or equal to ${expected}`
        : `Expected ${this.value} to be greater than or equal to ${expected}`;
      throw new Error(message);
    }
  }

  lessThanOrEqual(expected: number): void {
    const passed = this.negated ? this.value > expected : this.value <= expected;
    if (!passed) {
      const message = this.negated 
        ? `Expected ${this.value} not to be less than or equal to ${expected}`
        : `Expected ${this.value} to be less than or equal to ${expected}`;
      throw new Error(message);
    }
  }

  toBe(expected: any): void {
    this.strictEqual(expected);
  }

  toEqual(expected: any): void {
    // Deep equality check for objects and arrays
    const passed = this.negated ? !this.deepEqual(this.value, expected) : this.deepEqual(this.value, expected);
    if (!passed) {
      const message = this.negated 
        ? `Expected ${JSON.stringify(this.value)} not to equal ${JSON.stringify(expected)}`
        : `Expected ${JSON.stringify(this.value)} to equal ${JSON.stringify(expected)}`;
      throw new Error(message);
    }
  }

  toBeNull(): void {
    const passed = this.negated ? this.value !== null : this.value === null;
    if (!passed) {
      const message = this.negated 
        ? `Expected ${this.value} not to be null`
        : `Expected ${this.value} to be null`;
      throw new Error(message);
    }
  }

  toBeUndefined(): void {
    const passed = this.negated ? this.value !== undefined : this.value === undefined;
    if (!passed) {
      const message = this.negated 
        ? `Expected ${this.value} not to be undefined`
        : `Expected ${this.value} to be undefined`;
      throw new Error(message);
    }
  }

  toBeTruthy(): void {
    const passed = this.negated ? !this.value : !!this.value;
    if (!passed) {
      const message = this.negated 
        ? `Expected ${this.value} not to be truthy`
        : `Expected ${this.value} to be truthy`;
      throw new Error(message);
    }
  }

  toBeFalsy(): void {
    const passed = this.negated ? !!this.value : !this.value;
    if (!passed) {
      const message = this.negated 
        ? `Expected ${this.value} not to be falsy`
        : `Expected ${this.value} to be falsy`;
      throw new Error(message);
    }
  }

  toContain(expected: any): void {
    let contains = false;
    
    if (typeof this.value === 'string' && typeof expected === 'string') {
      contains = this.value.includes(expected);
    } else if (Array.isArray(this.value)) {
      contains = this.value.includes(expected);
    } else if (this.value && typeof this.value === 'object') {
      contains = Object.values(this.value).includes(expected);
    }
    
    const passed = this.negated ? !contains : contains;
    if (!passed) {
      const message = this.negated 
        ? `Expected ${JSON.stringify(this.value)} not to contain ${JSON.stringify(expected)}`
        : `Expected ${JSON.stringify(this.value)} to contain ${JSON.stringify(expected)}`;
      throw new Error(message);
    }
  }

  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    
    if (a == null || b == null) return a === b;
    
    if (typeof a !== typeof b) return false;
    
    if (typeof a !== 'object') return a === b;
    
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!this.deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
}

/**
 * Expect function implementation
 */
export function expect(value: any): Assertion {
  const assertion = new Assertion(value);
  
  // If we're in a describe block but not in an it block, 
  // we need to handle assertions directly
  if (isInDescribe && !isInIt && currentDescribe) {
    try {
      // Return the assertion for chaining, but we'll catch errors at the describe level
      return assertion;
    } catch (error) {
      // This will be caught by the describe block
      throw error;
    }
  }
  
  return assertion;
}

/**
 * Global setup - attach to window for browser compatibility
 */
if (typeof window !== 'undefined') {
  (window as any).describe = describe;
  (window as any).it = it;
  (window as any).expect = expect;
  (window as any).resetTestResults = resetTestResults;
  (window as any).getTestResults = getTestResults;
}

// Export for module usage
export { describe as globalDescribe, it as globalIt, expect as globalExpect };