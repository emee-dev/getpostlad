"use client";

import { File } from "@/app/page";
import { useEffect, useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";

interface PreviewProps {
  files: File[];
}

export function Preview({ files }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const htmlFile = files.find((file) => file.name === "index.html");
    const cssFile = files.find((file) => file.name === "styles.css");
    const jsFile = files.find((file) => file.name === "script.js");

    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlFile?.content || "");
        doc.close();

        if (cssFile) {
          const style = doc.createElement("style");
          style.textContent = cssFile.content;
          doc.head.appendChild(style);
        }

        if (jsFile) {
          const script = doc.createElement("script");
          script.textContent = jsFile.content;
          doc.body.appendChild(script);
        }
      }
    }
  }, [files]);

  return (
    <div className="h-full bg-background">
      <div className="flex h-10 items-center border-b px-4">
        <span className="text-sm font-medium">Preview</span>
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)]">
        <iframe
          ref={iframeRef}
          className="h-full w-full border-none bg-white"
          title="preview"
          sandbox="allow-scripts"
        />
      </ScrollArea>
    </div>
  );
}