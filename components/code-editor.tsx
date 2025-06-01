"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { vscodeDark } from "@uiw/codemirror-themes-all";
import { ScrollArea } from "./ui/scroll-area";

interface CodeEditorProps {
  content: string;
  language: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ content, language, onChange }: CodeEditorProps) {
  const getLanguageExtension = (lang: string) => {
    switch (lang) {
      case "javascript":
        return javascript();
      case "html":
        return html();
      case "css":
        return css();
      default:
        return javascript();
    }
  };

  return (
    <div className="h-full">
      <div className="flex h-10 items-center border-b px-4">
        <span className="text-sm font-medium">{language.toUpperCase()}</span>
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)]">
        <CodeMirror
          value={content}
          height="100%"
          theme={vscodeDark}
          extensions={[getLanguageExtension(language)]}
          onChange={onChange}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </ScrollArea>
    </div>
  );
}