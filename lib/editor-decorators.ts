import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";

export type DecoratorFn = (source: string) => void;

class HttpDecoratorWidget extends WidgetType {
  private clickHandler: (e: MouseEvent) => void;

  constructor(
    private onClick: (name: string) => void,
    private source: string
  ) {
    super();

    this.clickHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.onClick(this.source);
    };
  }

  toDOM() {
    const dom = document.createElement("div");
    dom.className = "cm-http-decorator";
    dom.textContent = `Send Request`;

    Object.assign(dom.style, {
      fontSize: "12px",
      paddingBottom: "0.5px",
      borderRadius: "4px",
      cursor: "pointer",
      width: "fit-content",
      color: "var(--http-decorator-color)",
    });

    dom.addEventListener("click", this.clickHandler);

    return dom;
  }

  destroy(dom: HTMLElement): void {
    dom.removeEventListener("click", this.clickHandler);
  }

  ignoreEvent() {
    return false;
  }
}

function findMethods(
  view: EditorView,
  onClick: (name: string) => void
): DecorationSet {
  let widgets: Range<Decoration>[] = [];
  const knownMethods = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "HEAD",
    "OPTIONS",
    "CONNECT",
    "TRACE",
  ] as const;

  // Tracks decorators to avoid duplicates
  const seen = new Set<number>();

  // Match functions with variable names starting with a http method.
  const methodPattern = new RegExp(
    `(?:function|const)\\s+(${knownMethods.join("|")})\\b`
  );

  for (let { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(node) {
        if (
          node.name === "FunctionDeclaration" ||
          node.name === "VariableDeclaration"
        ) {
          if (seen.has(node.from)) return; // Skip if already processed
          seen.add(node.from);

          const text = view.state.doc.sliceString(node.from, node.to);
          const match = methodPattern.exec(text);

          if (match) {
            const deco = Decoration.widget({
              widget: new HttpDecoratorWidget(onClick, text),
              side: -1,
            });
            widgets.push(deco.range(node.from));
          }
        }
      },
    });
  }

  return Decoration.set(widgets);
}

export const createEditorDecorators = (onClick: DecoratorFn) => {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = findMethods(view, onClick);
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.viewportChanged ||
          syntaxTree(update.startState) != syntaxTree(update.state)
        ) {
          this.decorations = findMethods(update.view, onClick);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
};
