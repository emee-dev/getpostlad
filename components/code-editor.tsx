import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-themes-all";
import { createEditorDecorators } from "@/lib/editor-decorators";
import { useEffect, useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";

interface CodeEditorProps {
  content: string;
  language: string;
  onChange: (value: string) => void;
  onResponse: (data: any) => void;
}

export function CodeEditor({ content, language, onChange, onResponse }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView>();

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: content,
      extensions: [
        basicSetup,
        javascript(),
        vscodeDark,
        createEditorDecorators(onResponse),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": { height: "100%" }
        })
      ],
      parent: editorRef.current
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

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