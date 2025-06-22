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
import {
  deserializeHttpFn,
  interpolateVariables,
  type DeserializedHTTP,
} from "@/lib/utils";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  TestResult,
  preRequestRuntime,
  postResponseRuntime,
} from "@/lib/runtime";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import { useWorkspace } from "@/hooks/use-workspace";
import { RequestScript, ResponseScript } from "@/lib/scripting";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { MobileWarningDialog } from "@/components/mobile-warning-dialog";

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

export default function Home() {
  const { theme } = useTheme();
  const { selectedFile, updateFile } = useFileTreeStore();
 const { selectedEnvironment, isResultPanelVisible, selectedWorkspace } = useWorkspace();

  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<ResponseData | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const editor = useRef<EditorView | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Mobile detection and warning dialog
  const isMobile = useMobileDetection();
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [mobileWarningDismissed, setMobileWarningDismissed] = useState(false);

  const findHistory = useQuery(
    api.request_history.findResponse,
    selectedWorkspace && selectedFile
      ? {
          requestPath: selectedFile.path as string,
          workspaceId: selectedWorkspace._id,
        }
      : "skip"
  );

  // Handle mobile detection
  useEffect(() => {
    if (isMobile === true && !mobileWarningDismissed) {
      setShowMobileWarning(true);
    }
  }, [isMobile, mobileWarningDismissed]);

  const handleMobileContinue = () => {
    setShowMobileWarning(false);
    setMobileWarningDismissed(true);
  };

  const handleMobileQuit = () => {
    // Try to close the tab/window
    if (typeof window !== 'undefined') {
      // First try to close the window (works if opened by script)
      try {
        window.close();
      } catch (error) {
        // If that fails, redirect to a friendly exit page or blank page
        window.location.href = 'about:blank';
      }
    }
  };

  const onSend = async (src: string) => {
    console.log("Sending request:", src);

    try {
      setIsPending(true);
      setData(null);
      setTestResults([]); // Reset test results

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      const environments = {} as Record<string, string>;

      if (selectedEnvironment?.variables) {
        selectedEnvironment?.variables.forEach((item) => {
          environments[item.key] = item.value;
        });
      }

      const formattedSrc = interpolateVariables(src, environments);

      const deserializedSrc: DeserializedHTTP = deserializeHttpFn(formattedSrc);

      // Create RequestScript instance
      const req = new RequestScript({
        url: deserializedSrc.url,
        method: deserializedSrc.method,
        headers: deserializedSrc.headers,
        query: deserializedSrc.query,
        body: deserializedSrc.body,
        json: deserializedSrc.json,
        xml: deserializedSrc.xml,
        text: deserializedSrc.text,
        environments,
      });

      // Execute pre_request script if present
      let preRequestResults: TestResult[] = [];
      if (deserializedSrc.pre_request) {
        try {
          preRequestResults = preRequestRuntime(
            deserializedSrc.pre_request,
            req
          );
        } catch (error) {
          console.error("Error executing pre_request script:", error);
        }
      }

      // Build axios request config using RequestScript
      const axiosConfig: AxiosRequestConfig = {
        method: req.getMethod().toLowerCase() as any,
        url: req.getUrl(),
        headers: req.getHeaders(),
        params: req.getQuery(),
        signal: abortControllerRef.current.signal, // Add abort signal
      };

      // Add body data if present
      const bodyData = req.getBodyData();
      if (bodyData !== null) {
        axiosConfig.data = bodyData;
      }

      // Record start time for elapsed time calculation
      const startTime = Date.now();

      // Make the request
      const response: AxiosResponse = await axios(axiosConfig);

      // Calculate elapsed time
      const elapsedTime = (Date.now() - startTime) / 1000;

      // Transform response headers to our format
      const responseHeaders: Header[] = Object.entries(response.headers).map(
        ([key, value]) => ({
          key,
          value: String(value),
        })
      );

      // Convert response data to string
      let textResponse: string;
      if (typeof response.data === "string") {
        textResponse = response.data;
      } else {
        textResponse = JSON.stringify(response.data, null, 2);
      }

      // Calculate content size
      const contentSize = new Blob([textResponse]).size;

      // Create ResponseScript instance
      const res = new ResponseScript({
        headers: responseHeaders,
        text_response: textResponse,
        status: response.status,
        elapsed_time: elapsedTime,
        content_size: contentSize,
        environments,
      });

      // Execute post_response script if present
      let postResponseResults: TestResult[] = [];
      if (deserializedSrc.post_response) {
        try {
          postResponseResults = postResponseRuntime(
            deserializedSrc.post_response,
            res
          );
        } catch (error) {
          console.error("Error executing post_response script:", error);
        }
      }

      // Combine test results from pre_request and post_response
      const combinedTestResults = [
        ...preRequestResults,
        ...postResponseResults,
      ];
      setTestResults(combinedTestResults);

      // Set the response data using ResponseScript
      const responseData: ResponseData = {
        headers: responseHeaders,
        text_response: res.getText(),
        status: res.getStatus(),
        elapsed_time: res.getElapsedTime(),
        content_size: res.getContentSize(),
      };

      setData(responseData);
    } catch (error: any) {
      console.error("Request failed:", error);

      // Check if request was cancelled
      if (axios.isCancel(error) || error.name === "AbortError") {
        console.log("Request was cancelled");

        const errorResponseData: ResponseData = {
          headers: [],
          text_response: JSON.stringify(
            {
              error: error.message || "Network error occurred",
              code: error.code || "UNKNOWN_ERROR",
            },
            null,
            2
          ),
          status: 0,
          elapsed_time: 0,
          content_size: 0,
        };

        setData(errorResponseData);

        return;
      }

      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        const elapsedTime = (Date.now() - Date.now()) / 1000; // This will be very small for errors

        const responseHeaders: Header[] = Object.entries(
          error.response.headers || {}
        ).map(([key, value]) => ({
          key,
          value: String(value),
        }));

        let textResponse: string;
        if (typeof error.response.data === "string") {
          textResponse = error.response.data;
        } else {
          textResponse = JSON.stringify(
            error.response.data || { error: "Request failed" },
            null,
            2
          );
        }

        const contentSize = new Blob([textResponse]).size;

        // Create ResponseScript for error response
        const errorRes = new ResponseScript({
          headers: responseHeaders,
          text_response: textResponse,
          status: error.response.status,
          elapsed_time: elapsedTime,
          content_size: contentSize,
        });

        const errorResponseData: ResponseData = {
          headers: responseHeaders,
          text_response: errorRes.getText(),
          status: errorRes.getStatus(),
          elapsed_time: errorRes.getElapsedTime(),
          content_size: errorRes.getContentSize(),
        };

        setData(errorResponseData);
      } else {
        // Network error or other issues
        const errorResponseData: ResponseData = {
          headers: [],
          text_response: JSON.stringify(
            {
              error: error.message || "Network error occurred",
              code: error.code || "UNKNOWN_ERROR",
            },
            null,
            2
          ),
          status: 0,
          elapsed_time: 0,
          content_size: 0,
        };

        setData(errorResponseData);
      }
    } finally {
      setIsPending(false);
      abortControllerRef.current = null;
    }
  };

  const onCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsPending(false);
      console.log("Request cancelled");
    }
  };

  const handleCoffeeClick = () => {
    window.open("https://www.buymeacoffee.com/emee_dev", "_blank");
  };

  const handleLoadHistoryResponse = (historyData: ResponseData) => {
    setData(historyData);
  };

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

  // Update the response panel
  useEffect(() => {
    if (
      selectedWorkspace &&
      findHistory &&
      selectedFile &&
      selectedFile.type === "file"
    ) {
      setData({
        content_size: findHistory.content_size,
        elapsed_time: findHistory.elapsed_time,
        headers: findHistory.headers,
        status: findHistory.status,
        text_response: findHistory.text_response,
      });
    }
  }, [selectedFile, findHistory, selectedWorkspace]);
  

  return (
    <>
      {/* Mobile Warning Dialog */}
      <MobileWarningDialog
        open={showMobileWarning}
        onContinue={handleMobileContinue}
        onQuit={handleMobileQuit}
      />

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
              testResults={testResults}
              onLoadHistoryResponse={handleLoadHistoryResponse}
            />
          </section>

          <footer className="relative flex items-center justify-center px-2 py-2 text-xs text-gray-500 border-t">
            <div className="relative w-24 h-full flex justify-center">
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

            <div className="absolute right-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCoffeeClick()}
                className="hover:dark:text-yellow-200"
              >
                <Coffee className="mr-1 h-4 w-4" />
                Buy me a coffee
              </Button>
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
  onCancel,
  testResults,
  onLoadHistoryResponse
}: {
  isResultPanelVisible: boolean;
  data: ResponseData | null;
  code: string;
  theme: string | undefined;
  isPending: boolean;
  editor: MutableRefObject<EditorView | null>;
  onSend: (source: string) => void;
  setCode: (val: string) => void;
  onCancel: () => void;
  testResults: TestResult[];
  onLoadHistoryResponse: (historyData: ResponseData) => void;
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
        <CodeEditor
            language="javascript"
            value={code}
            onDecoratorClick={(src) => onSend(src)}
            onChange={(val) => setCode(val)}
            theme={(theme as any) || "system"}
          />
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
        <ResponsePanel 
          data={data} 
          theme={theme} 
          isPending={isPending} 
          onCancel={onCancel} 
          testResults={testResults}
          onLoadHistoryResponse={onLoadHistoryResponse}
        />
      </div>
    </div>
  );
};