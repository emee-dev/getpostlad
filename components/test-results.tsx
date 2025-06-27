"use client";

import { TestResult } from "@/lib/runtime";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface TestResultsProps {
  results: TestResult[];
}

interface TestItemProps {
  result: TestResult;
  level?: number;
  isLast?: boolean;
}

const TestItem = ({ result, level = 0, isLast = false }: TestItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (result.type === "describe") {
    const hasChildren = result.it && result.it.length > 0;
    const hasError = result.error && !hasChildren;

    return (
      <div className=" text-sm">
        {/* Describe block header */}
        <div
          className="flex items-center py-0.5 cursor-pointer hover:bg-muted/30 rounded-sm group relative"
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        >
          {/* Vertical guide line from parent */}
          {level > 0 && (
            <div className="absolute left-2 top-0 bottom-0 w-px bg-muted-foreground/30" />
          )}

          <div className="flex items-center">
            <span className="mr-2 text-base leading-none">
              {result.passed === true ? (
                <Check className="size-4 text-green-600 dark:text-green-400" />
              ) : (
                <X className="size-4 text-red-600 dark:text-red-400" />
              )}
            </span>

            {/* Test name */}
            <span
              className={cn(
                "font-medium",
                result.passed === true && "text-green-600 dark:text-green-400",
                result.passed === false && "text-red-600 dark:text-red-400"
              )}
            >
              {result.name}
            </span>
          </div>

          {hasChildren && (
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-muted-foreground/20 text-muted-foreground size-6 ml-auto mr-2 hover:dark:bg-muted-foreground/15"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Error for describe blocks without it blocks */}
        {hasError && (
          <div className="relative">
            {/* Vertical guide line */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-muted-foreground/30" />

            <div className="ml-6 text-muted-foreground text-xs py-0.5">
              {result.error}
            </div>
          </div>
        )}

        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Vertical guide line connecting to children */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-muted-foreground/30" />

            <div className="ml-4">
              {result.it!.map((childResult, index) => (
                <TestItem
                  key={childResult.id}
                  result={childResult}
                  level={level + 1}
                  isLast={index === result.it!.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" style={{ marginLeft: `${level * 6}px` }}>
      {/* Vertical line from parent */}
      {!isLast && (
        <div className="absolute left-2 top-0 bottom-0 w-px bg-muted-foreground/30" />
      )}

      {/* Horizontal connector to icon */}
      <div className="absolute left-2 top-[18px] w-4 h-px bg-muted-foreground/30" />

      <div className="flex items-start py-1 pl-8 pt-2 pr-2 text-sm">
        {/* Status icon */}
        <span className="mr-2 mt-[2px]">
          {result.passed === true ? (
            <Check className="size-4 text-green-600 dark:text-green-400" />
          ) : (
            <X className="size-4 text-red-600 dark:text-red-400" />
          )}
        </span>

        {/* Test name and optional error message */}
        <div className="flex-1">
          <div
            className={cn(
              result.passed === true && "text-green-600 dark:text-green-400",
              result.passed === false && "text-red-600 dark:text-red-400"
            )}
          >
            {result.name}
          </div>
          {result.error && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {result.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TestResults = ({ results }: TestResultsProps) => {
  if (!results || results.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <div className="text-center ">
          <div className="text-sm">No test results available</div>
          <div className="text-xs mt-1 opacity-70">
            Run tests to see results here
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const calculateStats = (results: TestResult[]) => {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    const processResult = (result: TestResult) => {
      if (result.type === "describe") {
        if (result.it && result.it.length > 0) {
          // Has it blocks
          result.it.forEach(processResult);
        } else {
          // Standalone describe block
          totalTests += 1;
          if (result.passed === true) passedTests += 1;
          else if (result.passed === false) failedTests += 1;
        }
      } else if (result.type === "it") {
        totalTests += 1;
        if (result.passed === true) passedTests += 1;
        else if (result.passed === false) failedTests += 1;
      }
    };

    results.forEach(processResult);
    return { totalTests, passedTests, failedTests };
  };

  const { totalTests, passedTests, failedTests } = calculateStats(results);

  return (
    <div className="space-y-3 font-geist">
      {/* Summary header */}
      {totalTests > 0 && (
        <div className="flex items-center gap-4 pb-2 border-b border-border/30 text-xs">
          {passedTests > 0 && (
            <div className="flex items-center gap-1">
              <Check className="size-4 text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400">
                {passedTests} passed
              </span>
            </div>
          )}
          {failedTests > 0 && (
            <div className="flex items-center gap-1">
              <X className="size-4 text-red-600 dark:text-red-400" />
              <span className="text-red-600 dark:text-red-400">
                {failedTests} failed
              </span>
            </div>
          )}
          <div className="text-muted-foreground">{totalTests} total</div>
        </div>
      )}

      {/* Test results tree */}
      <div className="space-y-1">
        {results.map((result, index) => (
          <TestItem
            key={result.id}
            result={result}
            isLast={index === results.length - 1}
          />
        ))}
      </div>
    </div>
  );
};
