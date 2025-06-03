"use client";

import { ScrollArea } from "./ui/scroll-area";

interface ResponsePanelProps {
  response: any;
}

export function ResponsePanel({ response }: ResponsePanelProps) {
  return (
    <div className="h-full bg-background">
      <div className="flex h-10 items-center border-b px-4">
        <span className="text-sm font-medium">Response</span>
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)]">
        <div className="p-4">
          {response ? (
            <pre className="whitespace-pre-wrap break-words bg-muted p-4 rounded-lg">
              {JSON.stringify(response, null, 2)}
            </pre>
          ) : (
            <div className="text-muted-foreground text-sm">
              No response yet. Click the "Send Request" button above a function to make a request.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}