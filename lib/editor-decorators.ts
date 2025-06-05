import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/state";

const variables = [
  "TOKEN",
  "USER_ID",
  "EMAIL",
  "PASSWORD",
  "NAME",
  "ROLE",
  "PAGE",
  "LIMIT",
  "CATEGORY",
  "API_KEY",
  "BASE_URL",
];

class VariablePickerWidget extends WidgetType {
  constructor(private readonly view: EditorView, private readonly pos: number) {
    super();
  }

  toDOM() {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-variable-picker";

    variables.forEach(variable => {
      const item = document.createElement("div");
      item.className = "cm-variable-item";
      item.textContent = variable;
      item.onclick = () => {
        const insertion = `{{ ${variable} }}`;
        this.view.dispatch({
          changes: { from: this.pos, insert: insertion }
        });
        wrapper.remove();
      };
      wrapper.appendChild(item);
    });

    return wrapper;
  }
}

class RequestWidget extends WidgetType {
  constructor(
    private readonly method: string,
    private readonly onExecute: () => void
  ) {
    super();
  }

  toDOM() {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-request-wrapper";

    const methodBadge = document.createElement("span");
    methodBadge.textContent = this.method;
    methodBadge.className = `cm-method-badge ${this.method.toLowerCase()}`;

    const button = document.createElement("button");
    button.textContent = "Send Request";
    button.className = "cm-request-button";
    button.onclick = this.onExecute;

    wrapper.appendChild(methodBadge);
    wrapper.appendChild(button);
    return wrapper;
  }
}

const variableRegex = /{{([^}]+)}}/g;

function createDecorations(view: EditorView, onResponse: (data: any) => void) {
  const decorations: Range<Decoration>[] = [];
  const content = view.state.doc.toString();
  
  // Variable highlighting
  let match;
  while ((match = variableRegex.exec(content)) !== null) {
    decorations.push(Decoration.mark({
      class: "cm-variable-highlight"
    }).range(match.index, match.index + match[0].length));
  }

  // Function decorations
  const tree = syntaxTree(view.state);
  let lastLine = -1;

  tree.iterate({
    enter: (node) => {
      const nodeText = view.state.doc.sliceString(node.from, node.to);
      const line = view.state.doc.lineAt(node.from);
      
      if (line.number === lastLine) return;

      if (
        (node.type.name === "FunctionDeclaration" || 
         node.type.name === "VariableDefinition") &&
        (nodeText.includes("POST") || nodeText.includes("GET"))
      ) {
        lastLine = line.number;
        const method = nodeText.includes("POST") ? "POST" : "GET";

        const executeRequest = async () => {
          try {
            onResponse({ isLoading: true });
            
            const fn = new Function(nodeText + "\nreturn " + 
              (nodeText.includes("function") ? 
                nodeText.match(/function\s+(\w+)/)?.[1] : 
                nodeText.match(/const\s+(\w+)/)?.[1]
              ) + "();");
            
            const config = fn();
            const url = new URL(config.url);
            
            if (config.query) {
              Object.entries(config.query).forEach(([key, value]) => {
                url.searchParams.append(key, String(value).replace(/[{}]/g, "").trim());
              });
            }

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const response = await fetch(url.toString(), {
              method,
              headers: config.headers,
              body: config.body ? JSON.stringify(config.body) : undefined
            });

            const data = await response.json();
            onResponse({ data, isLoading: false });
          } catch (error) {
            onResponse({ error: error.message, isLoading: false });
          }
        };

        decorations.push(Decoration.line({
          attributes: { class: "http-function-line" }
        }).range(line.from));

        decorations.push(Decoration.widget({
          widget: new RequestWidget(method, executeRequest),
          side: -1
        }).range(line.from));
      }
    }
  });

  return Decoration.set(decorations, true);
}

export function createEditorDecorators(onResponse: (data: any) => void) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = createDecorations(view, onResponse);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = createDecorations(update.view, onResponse);
        }
      }
    },
    {
      decorations: (v) => v.decorations,

      eventHandlers: {
        dblclick(e: MouseEvent, view: EditorView) {
          const pos = view.posAtDOM(e.target as Node);
          if (pos !== null) {
            view.dispatch({
              effects: ViewPlugin.define(() => ({
                update: () => {},
                destroy: () => {}
              })).add(view.state.create({
                widget: new VariablePickerWidget(view, pos)
              }))
            });
          }
        }
      }
    }
  );
}