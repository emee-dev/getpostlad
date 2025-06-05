"use client";

import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useEffect, useRef } from "react";
import { catppuccinLatte } from "@catppuccin/codemirror";

interface ResponsePanelProps {
  response: any;
}

export function ResponsePanel({ response }: ResponsePanelProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView>();

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: response ? JSON.stringify(response, null, 2) : "",
      extensions: [
        basicSetup,
        javascript(),
        catppuccinLatte,
        EditorView.theme({
          "&": { height: "100%" }
        }),
        EditorView.editable.of(false)
      ],
      parent: editorRef.current
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    if (editorViewRef.current && response) {
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: JSON.stringify(response, null, 2)
        }
      });
    }
  }, [response]);

  // Sample headers for demonstration
  const headers = {
    "content-type": "application/json",
    "x-request-id": "abc123",
    "cache-control": "no-cache",
    "access-control-allow-origin": "*",
    "content-length": "1234"
  };

  return (
    <div className="h-full bg-background">
      <div className="flex h-10 items-center border-b px-4">
        <span className="text-sm font-medium">Response</span>
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)]">
        <div className="p-4">
          <Tabs defaultValue="body" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
            </TabsList>
            <TabsContent value="body">
              {response ? (
                <div ref={editorRef} className="h-[500px] border rounded-md" />
              ) : (
                <div className="text-muted-foreground text-sm">
                  No response yet. Click the "Send Request" button above a function to make a request.
                </div>
              )}
            </TabsContent>
            <TabsContent value="headers">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Header</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(headers).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-mono">{key}</TableCell>
                      <TableCell className="font-mono">{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );