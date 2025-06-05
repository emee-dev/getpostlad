import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { FileExplorer } from "@/components/file-explorer";
import { CodeEditor } from "@/components/code-editor";
import { ResponsePanel } from "@/components/response-panel";
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
      name: "requests",
      type: "directory",
      children: [
        {
          name: "auth",
          type: "directory",
          children: [
            {
              name: "login.js",
              type: "file",
              content: `const POST = () => ({
  url: "https://api.example.com/auth/login",
  headers: {
    "Content-Type": "application/json"
  },
  body: {
    email: "{{ EMAIL }}",
    password: "{{ PASSWORD }}"
  }
})`
            }
          ]
        },
        {
          name: "users",
          type: "directory",
          children: [
            {
              name: "get-user.js",
              type: "file",
              content: `function GET() {
  return {
    url: "https://api.example.com/users/{{ USER_ID }}",
    headers: {
      "Authorization": "Bearer {{ TOKEN }}",
      "Accept": "application/json"
    }
  }
}`
            },
            {
              name: "create-user.js",
              type: "file",
              content: `const POST = () => ({
  url: "https://api.example.com/users",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{ TOKEN }}"
  },
  body: {
    name: "{{ NAME }}",
    email: "{{ EMAIL }}",
    role: "{{ ROLE }}"
  }
})`
            }
          ]
        },
        {
          name: "products",
          type: "directory",
          children: [
            {
              name: "list-products.js",
              type: "file",
              content: `function GET() {
  return {
    url: "https://api.example.com/products",
    headers: {
      "Accept": "application/json"
    },
    query: {
      page: "{{ PAGE }}",
      limit: "{{ LIMIT }}",
      category: "{{ CATEGORY }}"
    }
  }
}`
            }
          ]
        }
      ]
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [response, setResponse] = useState<{ data?: any; error?: string; isLoading?: boolean } | null>(null);

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

  const handleResponse = (data: any) => {
    setResponse(data);
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
        <ResizablePanel defaultSize={45} minSize={30}>
          {selectedFile?.type === "file" && (
            <CodeEditor
              content={selectedFile.content || ""}
              language="javascript"
              onChange={handleFileContentChange}
              onResponse={handleResponse}
            />
          )}
        </ResizablePanel>
        <ResizablePanel defaultSize={40} minSize={30}>
          <ResponsePanel response={response?.data} isLoading={response?.isLoading} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );