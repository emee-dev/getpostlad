import { ResponseData } from "@/app/page";
import { CodeEditor } from "@/components/editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckCheck, Dot, Lightbulb, Menu } from "lucide-react";
import { Suspense, useEffect } from "react";
import { TestResults } from "@/components/test-results";
import { TestResult } from "@/lib/runtime";
import { useWorkspace } from "@/hooks/use-workspace";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useFileTreeStore } from "@/hooks/use-file-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ResponsePanelProps {
  data: ResponseData | null;
  theme: string | undefined;
  isPending: boolean;
  onCancel: () => void;
  testResults?: TestResult[];
  onLoadHistoryResponse?: (historyData: ResponseData) => void;
}

export function ResponsePanel({
  data,
  isPending,
  theme,
  onCancel,
  testResults,
  onLoadHistoryResponse,
}: ResponsePanelProps) {
  
  const { scripting, setScripting, selectedWorkspace } = useWorkspace();
  const { selectedFile } = useFileTreeStore();
  
  // Convex mutations and queries
  const deleteHistory = useMutation(api.request_history.deleteHistory);
  const deleteAllHistories = useMutation(
    api.request_history.deleteHistoriesByPath
  );
  const createResponseHistory = useMutation(api.request_history.createResponseHistory);
  
  // Get response histories for current request path
  const histories = useQuery(
    api.request_history.getHistories,
    selectedWorkspace && selectedFile?.path
      ? {
          workspaceId: selectedWorkspace._id,
          requestPath: selectedFile.path,
        }
      : "skip"
  );

  // Find current response in history (if it exists)
  const currentHistoryEntry =
    histories?.find((h) => h.status === data?.status) || histories?.at(0);

  const onSave = async () => {
    // Save current response data to history
    if (data && selectedWorkspace && selectedFile?.path) {
      try {
        await createResponseHistory({
          headers: data.headers,
          text_response: data.text_response,
          status: data.status,
          elapsed_time: data.elapsed_time,
          content_size: data.content_size,
          workspaceId: selectedWorkspace._id,
          requestPath: selectedFile.path,
        });
        console.log("Response saved to history");
      } catch (error) {
        console.error("Failed to save response to history:", error);
      }
    }
  };

  const onDeleteHistory = async () => {
    if (currentHistoryEntry) {
      try {
        await deleteHistory({ id: currentHistoryEntry._id });
        console.log("Response history deleted");
      } catch (error) {
        console.error("Failed to delete response history:", error);
      }
    }
  };

  const onDeleteAllHistories = async () => {
    if (selectedWorkspace && selectedFile?.path) {
      try {
        await deleteAllHistories({
          workspaceId: selectedWorkspace._id,
          requestPath: selectedFile.path,
        });
        console.log("All response histories deleted");
      } catch (error) {
        console.error("Failed to delete all response histories:", error);
      }
    }
  };

  const onCopyToClipboard = async () => {
    if (!data) return;

    try {
      // Format the response data for clipboard
      const clipboardContent = formatResponseForClipboard(data);
      
      // Copy to clipboard using the Clipboard API
      await navigator.clipboard.writeText(clipboardContent);
      
      console.log("Response copied to clipboard");
      // You could add a toast notification here for better UX
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Fallback for older browsers or when clipboard API fails
      try {
        const textArea = document.createElement("textarea");
        textArea.value = formatResponseForClipboard(data);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        console.log("Response copied to clipboard (fallback method)");
      } catch (fallbackError) {
        console.error("Fallback clipboard copy also failed:", fallbackError);
      }
    }
  };

  // Helper function to format response data for clipboard
  const formatResponseForClipboard = (responseData: ResponseData): string => {
    const lines: string[] = [];
    
    // Add status line
    lines.push(`HTTP/2.0 ${responseData.status}`);
    lines.push("");
    
    // Add headers section
    if (responseData.headers && responseData.headers.length > 0) {
      lines.push("/** Response headers below */");
      responseData.headers.forEach(header => {
        lines.push(`${header.key}: ${header.value}`);
      });
      lines.push("");
    }
    
    // Add body section
    lines.push("/** Response body below */");
    lines.push(responseData.text_response || "");
    
    return lines.join("\n");
  };
  
  const onToggleScripting = (mode: "run-once" | "auto-run") => {
    setScripting(mode);
  };

  const onLoadHistory = (historyItem: any) => {
    if (onLoadHistoryResponse) {
      const historyResponseData: ResponseData = {
        headers: historyItem.headers,
        text_response: historyItem.text_response,
        status: historyItem.status,
        elapsed_time: historyItem.elapsed_time,
        content_size: historyItem.content_size,
      };
      onLoadHistoryResponse(historyResponseData);
    }
  };

  // Check if workspace is selected for enabling/disabling actions
  const isWorkspaceSelected = selectedWorkspace !== null && selectedWorkspace !== undefined;
  
  if (isPending) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading response...</p>
          <Button className="" size="md" onClick={() => onCancel?.()}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full font-geist flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Lightbulb className="h-8 w-8" />
          <p className="text-muted-foreground text-sm">
            No response yet. Click the "Send Request" button to make a request.
          </p>
        </div>
      </div>
    );
  }

  const ActionsDropdownButton = () => {
    const button = (
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto hover:bg-muted-foreground/20 size-7 hover:dark:bg-muted-foreground/15"
      >
        <Menu className="h-4" />
        <span className="sr-only">More actions</span>
      </Button>
    );

    if (!isWorkspaceSelected) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent className="font-geist">
              <p>No workspace selected</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  return (
    <>
      <div className="top-0 flex items-center rounded-sm h-9 text-muted-foreground">
        <div className="flex items-center font-mono text-base ">
          <div className="flex items-center">
            <CheckCheck className=" mr-2 size-5 text-green-500" size={29} />
            <span className="text-sm">{data.status} Ok</span>
          </div>
          <div className="flex items-center">
            <Dot className="h-auto w-7 " size={29} />
            <span className="text-sm ">{data.elapsed_time} s</span>
          </div>
          <div className="flex items-center">
            <Dot className="h-auto w-7 " size={29} />
            <span className="text-sm ">{data.content_size} B</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!isWorkspaceSelected}>
            <ActionsDropdownButton />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="left">
            <DropdownMenuItem onClick={onSave} disabled={!data}>
              Save
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDeleteHistory}
              disabled={!currentHistoryEntry}
            >
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCopyToClipboard} disabled={!data}>
              Copy
            </DropdownMenuItem>
            
            <div className="flex items-center px-2 gap-x-1 font-geist text-xs py-2">
              <span className="text-muted-foreground/80">Scripts</span>
              <Separator orientation="horizontal" className="ml-1 w-[65%]" />
            </div>
            
            <DropdownMenuCheckboxItem 
              checked={scripting === "run-once"}
              onCheckedChange={() => onToggleScripting("run-once")}
            >
              Run once
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={scripting === "auto-run"}
              onCheckedChange={() => onToggleScripting("auto-run")}
            >
              Auto-run on Edit
            </DropdownMenuCheckboxItem>
            
            <div className="flex items-center px-2 gap-x-1 font-geist text-xs py-2">
              <span className="text-muted-foreground/80">History</span>
              <Separator orientation="horizontal" className="ml-1 w-[65%]" />
            </div>
            
            <DropdownMenuItem 
              onClick={onDeleteAllHistories}
              disabled={!histories || histories.length === 0}
            >
              Delete all responses
            </DropdownMenuItem>
            
            {histories && histories.length > 0 && (
              <>
                <Separator orientation="horizontal" className="my-0.5" />
                {histories.map((historyItem) => (
                  <DropdownMenuCheckboxItem
                    key={historyItem._id}
                    onClick={() => onLoadHistory(historyItem)}
                    checked={data && data.status === historyItem.status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span
                        className={`font-mono text-xs ${
                          historyItem.status >= 200 && historyItem.status < 300
                            ? "text-green-600 dark:text-green-400"
                            : historyItem.status >= 400
                              ? "text-red-600 dark:text-red-400"
                              : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {historyItem.status}
                      </span>
                      <ChevronRight className="size-3 mx-1 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(historyItem.elapsed_time * 1000)} ms
                      </span>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="scrollbar-hide">
        <Tabs defaultValue="body" className="h-full">
          <TabsList className="[&>*]:text-muted-foreground bg-transparent h-10 gap-x-2">
            <TabsTrigger
              variant="outline"
              value="body"
              className="pl-0 text-left font-base data-[state=active]:border-b-[1.8px]"
            >
              Body
            </TabsTrigger>
            <TabsTrigger
              variant="outline"
              value="headers"
              className="pl-0 text-left font-base data-[state=active]:border-b-[1.8px]"
            >
              Headers{" "}
              {data && data.headers && (
                <span className="ml-2 text-muted-foreground text-[10px]">
                  {data.headers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              variant="outline"
              value="tests"
              className="pl-0 text-left font-base data-[state=active]:border-b-[1.8px]"
            >
              Tests
              {testResults && testResults.length > 0 && (
                <span className="ml-2 text-muted-foreground text-[10px]">
                  {testResults.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="body" className="h-full">
            <div className=" w-full overflow-auto max-h-[calc(100vh-202px)] scrollbar-hide">
              {data && data.text_response && (
                <div>
                  <Suspense fallback={<div>Loading...</div>}>
                    <CodeEditor
                      value={data.text_response}
                      language={"json"}
                      readOnly
                      lineWrap
                      theme={(theme as any) || "system"}
                    />
                  </Suspense>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="headers" className="h-full font-mono">
            <div className="w-full overflow-auto max-h-[calc(100vh-202px)] scrollbar-hide">
              <table className="w-full h-full font-normal border-collapse table-fixed border-spacing-1">
                <tbody>
                  {data &&
                    data.headers &&
                    data.headers.map((header, index) => (
                      <tr
                        key={index}
                        className="text-xs border-t border-gray-300 dark:border-muted-foreground/50"
                      >
                        <td className="select-none py-0.5 pr-2 h-full align-top max-w-[10rem] text-[#A866FFFF]">
                          <span className="select-text cursor-text">
                            {header.key}
                          </span>
                        </td>
                        <td className="select-none py-0.5 break-all align-top max-w-[15rem]">
                          <div className="select-text cursor-text max-h-[5rem] overflow-y-auto grid grid-cols-[auto_minmax(0,1fr)_auto] dark:text-white/70">
                            {header.value}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="tests" className="h-full">
            <div className="w-full overflow-auto max-h-[calc(100vh-202px)] scrollbar-hide p-2">
              <TestResults results={testResults || []} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}