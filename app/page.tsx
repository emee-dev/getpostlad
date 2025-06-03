"use client";

import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { FileExplorer } from "@/components/file-explorer";
import { CodeEditor } from "@/components/code-editor";
import { Preview } from "@/components/preview";
import { Navbar } from "@/components/navbar";
import { useState } from "react";

export type FileNode = {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: FileNode[];
};

export default function Home() {
  const [files, setFiles] = useState<FileNode[]>([
    {
      name: "src",
      type: "directory",
      children: [
        {
          name: "components",
          type: "directory",
          children: [
            {
              name: "Button.js",
              type: "file",
              content: `export function Button({ children, onClick }) {
  return (
    <button 
      className="px-4 py-2 bg-blue-500 text-white rounded"
      onClick={onClick}
    >
      {children}
    </button>
  );
}`
            }
          ]
        },
        {
          name: "utils",
          type: "directory",
          children: [
            {
              name: "helpers.js",
              type: "file",
              content: `export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}`
            }
          ]
        },
        {
          name: "app.js",
          type: "file",
          content: `import { Button } from './components/Button';
import { formatDate } from './utils/helpers';

function App() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <p>Today is {formatDate(new Date())}</p>
      <Button onClick={() => alert('Hello!')}>
        Click me
      </Button>
    </div>
  );
}`
        }
      ]
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  const handleFileSelect = (file: FileNode) => {
    if (file.type === "file") {
      setSelectedFile(file);
    }
  };

  const handleFileContentChange = (content: string) => {
    if (!selectedFile) return;

    const updateFileContent = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.type === "directory" && node.children) {
          return {
            ...node,
            children: updateFileContent(node.children)
          };
        }
        if (node.type === "file" && node.name === selectedFile.name) {
          return {
            ...node,
            content
          };
        }
        return node;
      });
    };

    setFiles(updateFileContent(files));
    setSelectedFile({ ...selectedFile, content });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={15} minSize={10} maxSize={20}>
          <FileExplorer
            files={files}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
          />
        </ResizablePanel>
        <ResizablePanel defaultSize={85} minSize={30}>
          {selectedFile?.type === "file" && (
            <CodeEditor
              content={selectedFile.content || ""}
              language="javascript"
              onChange={handleFileContentChange}
            />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}