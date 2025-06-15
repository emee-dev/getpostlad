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
  foldGutter,
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
  EditorView,
} from "@codemirror/view";
import type * as CSS from "csstype";
import { useEffect, useRef } from "react";
import { DecoratorFn, liftCursor, variables } from "./extension";
import { ChevronDown, ChevronRight } from "./icons";

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
  // Custom fold gutter styles
  ".cm-foldGutter": {
    width: "16px",
  },
  ".cm-gutterElement": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "var(--editor-selection-color)",
    border: "1px solid hsl(var(--border))",
    borderRadius: "3px",
    color: "hsl(var(--muted-foreground))",
    fontSize: "11px",
    padding: "0 4px",
    margin: "0 2px",
  },
} satisfies ThemeSpec);

// Custom fold gutter extension with SVG chevrons
export function CustomGutter(): Extension {
  return foldGutter({
    markerDOM: (open) => {
      const element = document.createElement("div");
      element.className = "cm-fold-marker";
      element.style.cssText = `
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 14px;
        height: 14px;
        border-radius: 2px;
        transition: all 0.15s ease;
        color: hsl(var(--muted-foreground));
      `;

      // Custom SVG chevron icons
      const chevronDown = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      `;

      const chevronRight = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      `;

      element.innerHTML = open ? chevronDown : chevronRight;

      // Add hover effect
      element.addEventListener("mouseenter", () => {
        element.style.backgroundColor = "hsl(var(--accent))";
        element.style.color = "hsl(var(--accent-foreground))";
      });

      element.addEventListener("mouseleave", () => {
        element.style.backgroundColor = "transparent";
        element.style.color = "hsl(var(--muted-foreground))";
      });

      return element;
    },
  });
}

const baseExtensions: Extension[] = [
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  lineNumbers(),
  CustomGutter(),
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