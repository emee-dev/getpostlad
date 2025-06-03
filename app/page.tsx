"use client";

import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { FileExplorer } from "@/components/file-explorer";
import { CodeEditor } from "@/components/code-editor";
import { Preview } from "@/components/preview";
import { Navbar } from "@/components/navbar";
import { useState } from "react";

export type FileNode = {
  id: string;
  name: string;
  content: string;
  parent: string | null;
  type: "file" | "folder";
};

export default function Home() {
  const [files, setFiles] = useState<FileNode[]>([
    {
      id: "src",
      name: "src",
      content: "",
      parent: null,
      type: "folder"
    },
    {
      id: "src/index.js",
      name: "index.js",
      content: `console.log('Hello from index.js!');`,
      parent: "src",
      type: "file"
    },
    {
      id: "src/api",
      name: "api",
      content: "",
      parent: "src",
      type: "folder"
    },
    {
      id: "src/api/users.js",
      name: "users.js",
      content: `export const getUsers = () => {
  return [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ];
};`,
      parent: "src/api",
      type: "file"
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
    
    const updatedFiles = files.map((file) =>
      file.id === selectedFile.id ? { ...file, content } : file
    );
    setFiles(updatedFiles);
    setSelectedFile({ ...selectedFile, content });
  };

  const handleCreateFile = (parentId: string | null, name: string) => {
    const newFile: FileNode = {
      id: parentId ? `${parentId}/${name}` : name,
      name,
      content: "",
      parent: parentId,
      type: "file"
    };
    setFiles([...files, newFile]);
  };

  const handleCreateFolder = (parentId: string | null, name: string) => {
    const newFolder: FileNode = {
      id: parentId ? `${parentId}/${name}` : name,
      name,
      content: "",
      parent: parentId,
      type: "folder"
    };
    setFiles([...files, newFolder]);
  };

  const handleDeleteFile = (fileId: string) => {
    const updatedFiles = files.filter((file) => !file.id.startsWith(fileId));
    setFiles(updatedFiles);
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
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
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
            onDeleteFile={handleDeleteFile}
          />
        </ResizablePanel>
        <ResizablePanel defaultSize={85} minSize={30}>
          {selectedFile ? (
            <CodeEditor
              content={selectedFile.content}
              onChange={handleFileContentChange}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a file to edit
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}