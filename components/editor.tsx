import { Environment, useWorkspace } from "@/hooks/use-workspace";
import { createEditorDecorators } from "@/lib/editor-decorators";
import { cn } from "@/lib/utils";
import { catppuccinFrappe } from "@catppuccin/codemirror";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { lintKeymap } from "@codemirror/lint";
import { searchKeymap } from "@codemirror/search";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import {
  crosshairCursor,
  dropCursor,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import { EditorView } from "codemirror";
import type * as CSS from "csstype";
import { useEffect, useRef } from "react";
import { DecoratorFn, liftCursor, variables } from "./extension";

interface CodeEditorProps {
  value: string;
  className?: string;
  readOnly?: boolean;
  lineWrap?: boolean;
  theme?: "light" | "dark" | "system";
  onChange?: (value: string) => void;
  language?: "json" | "javascript";
  onDecoratorClick?: DecoratorFn;
}

type ThemeSpec = { [selector: string]: CSS.Properties };

const editorTheme = EditorView.theme({
  "&": { backgroundColor: "transparent" },
  "&.cm-editor": { backgroundColor: "transparent" },
  ".cm-content": { fontFamily: "var(--font-mono)", fontSize: "13px" },
  ".cm-gutters": {
    border: "none",
    backgroundColor: "transparent",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
  },
  ".cm-activeLine": { backgroundColor: "rgba(0, 0, 0, 0.1)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent" },
  ".cm-line": { fontFamily: "var(--font-mono)" },
  ".cm-scroller": {
    overflow: "auto",
    backgroundColor: "transparent",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  ".cm-scroller::-webkit-scrollbar": { display: "none" },
  "&.cm-editor.cm-focused": { outline: "none" },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "var(--editor-selection-color)",
  },
} satisfies ThemeSpec);

const baseExtensions: Extension[] = [
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  lineNumbers(),
  highlightSpecialChars(),
  history(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
  crosshairCursor(),
  liftCursor(),
  keymap.of([
    indentWithTab,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...closeBracketsKeymap,
    ...lintKeymap,
  ]),
];

export function CodeEditor({
  lineWrap = false,
  language = "json",
  onDecoratorClick,
  onChange,
  readOnly,
  className,
  value,
  theme,
}: CodeEditorProps) {
  const selectedEnvironment = useWorkspace((s) => s.selectedEnvironment);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const varCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());

  const latestEnvRef = useRef<Environment | null>(selectedEnvironment);
  const decoVersionRef = useRef(0);

  useEffect(() => {
    if (!editorContainerRef.current) return;

    viewRef.current?.destroy();

    const lang =
      language === "json" ? json() : javascript({ typescript: true });

    const extensions: Extension[] = [
      editorTheme,
      baseExtensions,
      lang,
      themeCompartment.current.of(theme === "dark" ? catppuccinFrappe : []),
      varCompartment.current.of(
        variables(() => latestEnvRef.current, decoVersionRef.current)
      ),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChange?.(update.state.doc.toString());
      }),
      createEditorDecorators((src) => onDecoratorClick?.(src)),
    ];

    if (readOnly) extensions.push(EditorState.readOnly.of(true));
    if (lineWrap) extensions.push(EditorView.lineWrapping);

    const state = EditorState.create({ doc: value, extensions });

    viewRef.current = new EditorView({
      state,
      parent: editorContainerRef.current,
    });

    return () => viewRef.current?.destroy();
  }, [language]);

  useEffect(() => {
    latestEnvRef.current = selectedEnvironment;
    decoVersionRef.current += 1;
  }, [selectedEnvironment]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: [
        themeCompartment.current.reconfigure(
          theme === "dark" ? catppuccinFrappe : []
        ),
      ],
    });
  }, [theme]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: [
        varCompartment.current.reconfigure(
          variables(() => latestEnvRef.current, decoVersionRef.current)
        ),
      ],
    });
  }, [selectedEnvironment]);

  useEffect(() => {
    const view = viewRef.current;
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <div ref={editorContainerRef} className="h-full"></div>
    </div>
  );
}
