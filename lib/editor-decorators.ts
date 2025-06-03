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
      };
      wrapper.appendChild(item);
    });

    return wrapper;
  }
}

class RequestWidget extends WidgetType {
  constructor(
    private readonly view: EditorView,
    private readonly functionContent: string,
    private readonly onResponse: (data: any) => void
  ) {
    super();
  }

  async executeRequest() {
    try {
      const fn = new Function(this.functionContent + "\nreturn " + 
        (this.functionContent.includes("function") ? 
          this.functionContent.match(/function\s+(\w+)/)?.[1] : 
          this.functionContent.match(/const\s+(\w+)/)?.[1]
        ) + "();");
      
      const config = fn();
      const url = new URL(config.url);
      
      if (config.query) {
        Object.entries(config.query).forEach(([key, value]) => {
          url.searchParams.append(key, String(value).replace(/[{}]/g, "").trim());
        });
      }

      const response = await fetch(url.toString(), {
        method: this.functionContent.includes("POST") ? "POST" : "GET",
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined
      });

      const data = await response.json();
      this.onResponse(data);
    } catch (error) {
      this.onResponse({ error: error.message });
    }
  }

  toDOM() {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-request-wrapper";

    const button = document.createElement("button");
    button.textContent = "Send Request";
    button.className = "cm-request-button";
    button.onclick = () => this.executeRequest();

    const method = this.functionContent.includes("POST") ? "POST" : "GET";
    const methodBadge = document.createElement("span");
    methodBadge.textContent = method;
    methodBadge.className = `cm-method-badge ${method.toLowerCase()}`;

    wrapper.appendChild(methodBadge);
    wrapper.appendChild(button);
    return wrapper;
  }
}

const variableRegex = /{{([^}]+)}}/g;

function createDecorations(view: EditorView) {
  const decorations: Range<Decoration>[] = [];
  const content = view.state.doc.toString();
  
  let match;
  while ((match = variableRegex.exec(content)) !== null) {
    const from = match.index;
    const to = from + match[0].length;
    
    decorations.push({
      from,
      to,
      value: Decoration.mark({
        class: "cm-variable-highlight"
      })
    });
  }

  const tree = syntaxTree(view.state);
  tree.iterate({
    enter: (node) => {
      const nodeText = view.state.doc.sliceString(node.from, node.to);
      
      if (
        (node.type.name === "FunctionDeclaration" || node.type.name === "VariableDefinition") &&
        (nodeText.includes("POST") || nodeText.includes("GET"))
      ) {
        let lineStart = node.from;
        while (lineStart > 0 && view.state.doc.sliceString(lineStart - 1, lineStart) !== "\n") {
          lineStart--;
        }
        
        decorations.push({
          from: Math.max(0, lineStart),
          to: Math.max(0, lineStart),
          value: Decoration.widget({
            widget: new RequestWidget(view, nodeText, (data) => {
              // Handle response
              console.log("Response:", data);
            }),
            block: true,
            side: -1
          })
        });
      }
    }
  });

  return Decoration.set(decorations, true);
}

export const editorDecorators = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = createDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = createDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations
  }
);