"use client";

import { CodeEditor } from "@/components/editor";
import { Navbar } from "@/components/navbar";
import { ResponsePanel } from "@/components/response-panel";
import { AppSidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useFileTreeStore } from "@/hooks/use-file-store";
import { cn } from "@/lib/utils";
import { EditorView } from "@codemirror/view";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { MutableRefObject, Suspense, useEffect, useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";

export type Header = {
  key: string;
  value: string;
};

export type ResponseData = {
  headers: Header[];
  text_response: string;
  status: number;
  elapsed_time: number;
  content_size: number;
};

const template = `const GET = () => {
  return {
    name: "Optional request {{BASE_URL}}",
    url: "https://httpbin.org/delay/5",
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  };
};

const POST = () => {
  return {
    name: "Get posts",
    url: "https://jsonplaceholder.typicode.com/posts",
    json: {
      title: 'foo',
      body: 'bar',
      userId: 1,
    },
  };
};
`;

export default function Home() {
  const { theme } = useTheme();
  const { selectedFile, updateFile, files: sidebarFileTree } = useFileTreeStore();

  const [code, setCode] = useState(template);
  const [isPending, setIsPending] = useState(false);
  const [isResultPanelVisible, setIsResultPanelVisible] = useState(true);
  const [webcontainerReady, setWebcontainerReady] = useState(false);
  const editor = useRef<EditorView | null>(null);
  const webcontainerRef = useRef<WebContainer | null>(null);

  // Initialize WebContainer
  useEffect(() => {
    let mounted = true;

    const initWebContainer = async () => {
      try {
        console.log("Booting WebContainer...");
        const webcontainerInstance = await WebContainer.boot();
        
        if (mounted) {
          webcontainerRef.current = webcontainerInstance;
          setWebcontainerReady(true);
          console.log("WebContainer ready!");
        }
      } catch (error) {
        console.error("Failed to boot WebContainer:", error);
      }
    };

    initWebContainer();

    // Cleanup function
    return () => {
      mounted = false;
      if (webcontainerRef.current) {
        console.log("Tearing down WebContainer...");
        webcontainerRef.current.teardown();
        webcontainerRef.current = null;
        setWebcontainerReady(false);
      }
    };
  }, []);

  const onSend = (src: string) => {
    console.log("Sending request:", src);
    console.log("WebContainer ready:", webcontainerReady);
    console.log("WebContainer instance:", webcontainerRef.current);
  };

  const data = null;

  // Set the content of selected file to code editor
  useEffect(() => {
    if (selectedFile && selectedFile.type === "file") {
      setCode(selectedFile.content as string);
    }
  }, [selectedFile]);

  // Update the content of selected file in the file tree
  useEffect(() => {
    if (selectedFile && selectedFile.type === "file") {
      updateFile(selectedFile.path as string, code);
    }
  }, [code]);

  return (
    <>
      <SidebarProvider defaultOpen={false} className="">
        <AppSidebar />

        <SidebarInset className="grid overflow-hidden grid-rows-[40px_1fr_36px] gap-y-1 w-screen h-screen dark:bg-muted">
          <Navbar className="h-10" />

          <section className="relative px-2 overflow-hidden">
            <HTTP_Layout
              data={data}
              code={code}
              theme={theme}
              editor={editor}
              onSend={onSend}
              setCode={setCode}
              isPending={isPending}
              isResultPanelVisible={isResultPanelVisible}
              webcontainerReady={webcontainerReady}
            />
          </section>

          <footer className="flex items-center justify-center px-2 py-2 text-xs text-gray-500 border-t">
            <div className="relative w-24 h-full">
              <Link
                href="https://bolt.new/"
                className="absolute -top-5 bg-black dark:bg-transparent p-2 rounded"
              >
                <Image
                  src="https://basic-nightingale-232.convex.cloud/api/storage/5d042f0c-9b4f-4646-ba36-920ffd90d37e"
                  alt="bolt logo"
                  width={75}
                  height={75}
                />
              </Link>
            </div>
            
            {/* WebContainer Status Indicator */}
            <div className="absolute right-2 flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                webcontainerReady ? "bg-green-500" : "bg-yellow-500"
              )} />
              <span className="text-xs">
                {webcontainerReady ? "Container Ready" : "Initializing..."}
              </span>
            </div>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

const HTTP_Layout = ({
  data,
  code,
  theme,
  onSend,
  editor,
  setCode,
  isPending,
  isResultPanelVisible,
  webcontainerReady,
}: {
  isResultPanelVisible: boolean;
  data: ResponseData | null;
  code: string;
  theme: string | undefined;
  isPending: boolean;
  editor: MutableRefObject<EditorView | null>;
  onSend: (source: string) => void;
  setCode: (val: string) => void;
  webcontainerReady: boolean;
}) => {
  return (
    <div className="flex h-full">
      <div
        className={cn(" scrollbar-hide overflow-auto px-1.5", {
          "w-1/2 flex-1 ": isResultPanelVisible,
          "flex-1 ": !isResultPanelVisible,
        })}
        onClick={() => editor.current?.focus()}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <CodeEditor
            language="javascript"
            value={code}
            onDecoratorClick={(src) => onSend(src)}
            onChange={(val) => setCode(val)}
            theme={(theme as any) || "system"}
          />
        </Suspense>
      </div>

      <div
        className={cn(
          " h-auto border  rounded-md px-1.5 border-black/10 dark:border-muted-foreground/20",
          {
            "w-1/2 flex-1 ": isResultPanelVisible,
            hidden: !isResultPanelVisible,
          }
        )}
      >
        <ResponsePanel data={data} theme={theme} isPending={isPending} />
      </div>
    </div>
  );
};