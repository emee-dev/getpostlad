"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type TestResult = {
  id: string;
  name: string;
  passed: boolean | null;
  error?: string;
  type: "describe" | "it";
  it?: TestResult[]; // present only on describe blocks
};

interface TestResultsProps {
  results: TestResult[];
}

interface TestItemProps {
  result: TestResult;
  level?: number;
}

const TestItem = ({ result, level = 0 }: TestItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const paddingLeft = level * 16;

  if (result.type === "describe") {
    const hasChildren = result.it && result.it.length > 0;
    const hasError = result.error && !hasChildren;

    return (
      <div className="font-mono text-sm">
        <div
          className={cn(
            "flex items-center py-1 cursor-pointer hover:bg-muted/50 rounded-sm",
            result.passed === true && "text-green-600 dark:text-green-400",
            result.passed === false && "text-red-600 dark:text-red-400"
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {hasChildren && (
            <div className="mr-2 flex-shrink-0">
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </div>
          )}
          
          <div className="mr-2 flex-shrink-0">
            {result.passed === true ? (
              <Check size={16} className="text-green-600 dark:text-green-400" />
            ) : (
              <X size={16} className="text-red-600 dark:text-red-400" />
            )}
          </div>
          
          <span className="font-medium">{result.name}</span>
        </div>

        {/* Show error for describe blocks without it blocks */}
        {hasError && (
          <div
            className="text-red-600 dark:text-red-400 text-xs mt-1 ml-6"
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            {result.error}
          </div>
        )}

        {/* Show children if expanded */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {result.it!.map((childResult) => (
              <TestItem
                key={childResult.id}
                result={childResult}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render "it" blocks
  return (
    <div
      className="flex items-center py-1 font-mono text-sm"
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      <div className="mr-2 flex-shrink-0">
        {result.passed === true ? (
          <Check size={14} className="text-green-600 dark:text-green-400" />
        ) : (
          <X size={14} className="text-red-600 dark:text-red-400" />
        )}
      </div>
      
      <div className="flex-1">
        <span
          className={cn(
            result.passed === true && "text-green-600 dark:text-green-400",
            result.passed === false && "text-red-600 dark:text-red-400"
          )}
        >
          {result.name}
        </span>
        
        {result.error && (
          <div className="text-red-600 dark:text-red-400 text-xs mt-1 ml-4">
            {result.error}
          </div>
        )}
      </div>
    </div>
  );
};

export const TestResults = ({ results }: TestResultsProps) => {
  if (!results || results.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <div className="text-center">
          <div className="text-sm">No test results available</div>
          <div className="text-xs mt-1">Run tests to see results here</div>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalTests = results.reduce((acc, result) => {
    if (result.type === "describe" && result.it) {
      return acc + result.it.length;
    } else if (result.type === "it") {
      return acc + 1;
    }
    return acc;
  }, 0);

  const passedTests = results.reduce((acc, result) => {
    if (result.type === "describe" && result.it) {
      return acc + result.it.filter(test => test.passed === true).length;
    } else if (result.type === "it" && result.passed === true) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const failedTests = totalTests - passedTests;

  return (
    <div className="space-y-2">
      {/* Summary header */}
      <div className="flex items-center gap-4 pb-2 border-b border-border/50 font-mono text-sm">
        <div className="flex items-center gap-1">
          <Check size={14} className="text-green-600 dark:text-green-400" />
          <span className="text-green-600 dark:text-green-400">{passedTests} passed</span>
        </div>
        {failedTests > 0 && (
          <div className="flex items-center gap-1">
            <X size={14} className="text-red-600 dark:text-red-400" />
            <span className="text-red-600 dark:text-red-400">{failedTests} failed</span>
          </div>
        )}
        <div className="text-muted-foreground">
          {totalTests} total
        </div>
      </div>

      {/* Test results tree */}
      <div className="space-y-1">
        {results.map((result) => (
          <TestItem key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
};