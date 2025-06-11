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
import { deserializeHttpFn, type DeserializedHTTP } from "@/lib/utils";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

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
  const [data, setData] = useState<ResponseData | null>(null);
  const editor = useRef<EditorView | null>(null);

  const onSend = async (src: string) => {
    console.log("Sending request:", src);
    
    try {
      setIsPending(true);
      setData(null);
      
      const deserializedSrc: DeserializedHTTP = deserializeHttpFn(src);
      
      // Build headers object from enabled headers
      const headers: Record<string, string> = {};
      deserializedSrc.headers.forEach(header => {
        if (header.enabled) {
          headers[header.key] = header.value;
        }
      });

      // Build axios request config
      const axiosConfig: AxiosRequestConfig = {
        method: deserializedSrc.method.toLowerCase() as any,
        url: deserializedSrc.url,
        headers,
      };

      // Add body/data if present
      if (deserializedSrc.body !== undefined) {
        if (typeof deserializedSrc.body === 'object' && deserializedSrc.body !== null) {
          axiosConfig.data = deserializedSrc.body;
        } else {
          axiosConfig.data = deserializedSrc.body;
        }
      }

      // Record start time for elapsed time calculation
      const startTime = Date.now();

      // Make the request
      const response: AxiosResponse = await axios(axiosConfig);
      
      // Calculate elapsed time
      const elapsedTime = (Date.now() - startTime) / 1000;

      // Transform response headers to our format
      const responseHeaders: Header[] = Object.entries(response.headers).map(([key, value]) => ({
        key,
        value: String(value)
      }));

      // Convert response data to string
      let textResponse: string;
      if (typeof response.data === 'string') {
        textResponse = response.data;
      } else {
        textResponse = JSON.stringify(response.data, null, 2);
      }

      // Calculate content size
      const contentSize = new Blob([textResponse]).size;

      // Set the response data
      const responseData: ResponseData = {
        headers: responseHeaders,
        text_response: textResponse,
        status: response.status,
        elapsed_time: elapsedTime,
        content_size: contentSize
      };

      setData(responseData);
      
    } catch (error: any) {
      console.error("Request failed:", error);
      
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        const elapsedTime = (Date.now() - Date.now()) / 1000; // This will be very small for errors
        
        const responseHeaders: Header[] = Object.entries(error.response.headers || {}).map(([key, value]) => ({
          key,
          value: String(value)
        }));

        let textResponse: string;
        if (typeof error.response.data === 'string') {
          textResponse = error.response.data;
        } else {
          textResponse = JSON.stringify(error.response.data || { error: 'Request failed' }, null, 2);
        }

        const contentSize = new Blob([textResponse]).size;

        const errorResponseData: ResponseData = {
          headers: responseHeaders,
          text_response: textResponse,
          status: error.response.status,
          elapsed_time: elapsedTime,
          content_size: contentSize
        };

        setData(errorResponseData);
      } else {
        // Network error or other issues
        const errorResponseData: ResponseData = {
          headers: [],
          text_response: JSON.stringify({ 
            error: error.message || 'Network error occurred',
            code: error.code || 'UNKNOWN_ERROR'
          }, null, 2),
          status: 0,
          elapsed_time: 0,
          content_size: 0
        };

        setData(errorResponseData);
      }
    } finally {
      setIsPending(false);
    }
  };

  const onCancel = () => {}

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
  }, [code, selectedFile, updateFile]);

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
              onCancel={onCancel}
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
  onCancel
}: {
  isResultPanelVisible: boolean;
  data: ResponseData | null;
  code: string;
  theme: string | undefined;
  isPending: boolean;
  editor: MutableRefObject<EditorView | null>;
  onSend: (source: string) => void;
  setCode: (val: string) => void;
  onCancel: () => void
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
        <ResponsePanel data={data} theme={theme} isPending={isPending} onCancel={onCancel} />
      </div>
    </div>
  );
};