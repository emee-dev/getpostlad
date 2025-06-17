import { ResponseData } from "@/app/page";
import { CodeEditor } from "@/components/editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckCheck, Dot, Lightbulb, Menu } from "lucide-react";
import { Suspense } from "react";
import { TestResults } from "@/components/test-results";
import { TestResult } from "@/lib/runtime";
import { useWorkspace } from "@/hooks/use-workspace";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export function ResponsePanel({
  data,
  isPending,
  theme,
  onCancel,
  testResults,
}: {
  data: ResponseData | null;
  theme: string | undefined;
  isPending: boolean;
  onCancel: () => void;
  testResults?: TestResult[];
}) {
  
  const { scripting, setScripting } = useWorkspace();

  const onSaveToFile = () => {}; // Do not implement this at the moment
  const onDeleteHistory = () => {};
  const onCopyToClipboard = () => {}; // Do not implement this at the moment
  
  const onToggleScripting = () => {
  // if run-once set to auto-run vice-versa
  };
  
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
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Lightbulb className="h-8 w-8" />
          <p className="text-muted-foreground text-sm">
            No response yet. Click the "Send Request" button to make a request.
          </p>
        </div>
      </div>
    );
  }

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
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto hover:bg-muted-foreground/20 size-7 hover:dark:bg-muted-foreground/15"
            >
              <Menu className="h-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="left">
            <DropdownMenuItem>Save to File</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
            <DropdownMenuItem>Copy to clipboard</DropdownMenuItem>
            <div className="flex items-center px-2 gap-x-1 font-geist text-xs py-2">
              <span className="text-muted-foreground/80">Scripts</span>{" "}
              <Separator orientation="horizontal" className="ml-1 w-[65%]" />
            </div>
            <DropdownMenuCheckboxItem checked={scripting === "run-once"}>
              Run once
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={scripting === "auto-run"}>
              Auto-run on Edit
            </DropdownMenuCheckboxItem>
            <div className="flex items-center px-2 gap-x-1 font-geist text-xs py-2">
              <span className="text-muted-foreground/80">History</span>{" "}
              <Separator orientation="horizontal" className="ml-1  w-[65%]" />
            </div>
            <DropdownMenuItem>Delete all responses</DropdownMenuItem>
            <Separator orientation="horizontal" className="my-0.5" />
            // map through the history from convex and list response
            <DropdownMenuCheckboxItem>
              <span>200</span> <ChevronRight className="size-4 mx-1" />{" "}
              <span>34 ms</span>
            </DropdownMenuCheckboxItem>
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
