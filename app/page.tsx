"use client";

import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { FileExplorer } from "@/components/file-explorer";
import { CodeEditor } from "@/components/code-editor";
import { Preview } from "@/components/preview";
import { Navbar } from "@/components/navbar";
import { useState } from "react";

export type File = {
  name: string;
  content: string;
  language: string;
};

export default function Home() {
  const [files, setFiles] = useState<File[]>([
    {
      name: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
        <h1>Welcome to My App</h1>
        <p>Start editing to see some magic happen!</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      language: "html",
    },
    {
      name: "styles.css",
      content: `body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    margin: 0;
    padding: 20px;
    background: #f5f5f5;
}

#app {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #333;
    margin-bottom: 20px;
}

p {
    color: #666;
    line-height: 1.6;
}`,
      language: "css",
    },
    {
      name: "script.js",
      content: `// Add your JavaScript code here
console.log('Hello from script.js!');

// Example: Add a click event to the paragraph
document.querySelector('p').addEventListener('click', () => {
    alert('You clicked the paragraph!');
});`,
      language: "javascript",
    },
  ]);

  const [selectedFile, setSelectedFile] = useState<File>(files[0]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileContentChange = (content: string) => {
    const updatedFiles = files.map((file) =>
      file.name === selectedFile.name ? { ...file, content } : file
    );
    setFiles(updatedFiles);
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
        <ResizablePanel defaultSize={45} minSize={30}>
          <CodeEditor
            content={selectedFile.content}
            language={selectedFile.language}
            onChange={handleFileContentChange}
          />
        </ResizablePanel>
        <ResizablePanel defaultSize={40} minSize={30}>
          <Preview files={files} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}