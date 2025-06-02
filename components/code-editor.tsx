import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { vscodeDark } from "@uiw/codemirror-themes-all";
import { editorDecorators } from "@/lib/editor-decorators";
import { useEffect, useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";

interface CodeEditorProps {
  content: string;
  language: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ content, language, onChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView>();

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

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: content,
      extensions: [
        basicSetup,
        getLanguageExtension(language),
        vscodeDark,
        editorDecorators,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": {
            height: "100%",
          },
          ".cm-variable-highlight": {
            background: "#3f51b520",
            borderRadius: "3px",
            padding: "0 2px",
            cursor: "pointer",
          },
          ".cm-variable-highlight:hover": {
            background: "#3f51b540",
          },
          ".cm-request-button": {
            fontSize: "12px",
            padding: "2px 6px",
            background: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            marginLeft: "8px",
          },
          ".cm-request-button:hover": {
            background: "#45a049",
          }
        })
      ],
      parent: editorRef.current
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language]);

  useEffect(() => {
    if (editorViewRef.current && content !== editorViewRef.current.state.doc.toString()) {
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: content
        }
      });
    }
  }, [content]);

  return (
    <div className="h-full">
      <div className="flex h-10 items-center border-b px-4">
        <span className="text-sm font-medium">{language.toUpperCase()}</span>
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)]">
        <div ref={editorRef} className="h-full" />
      </ScrollArea>
    </div>
  );
}