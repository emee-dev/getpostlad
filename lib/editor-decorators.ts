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

// Widget for the "Send request" button
class RequestWidget extends WidgetType {
  private functionContent: string;

  constructor(functionContent: string) {
    super();
    this.functionContent = functionContent;
  }

  toDOM() {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.marginBottom = "4px";

    const button = document.createElement("button");
    button.textContent = "Send request";
    button.className = "cm-request-button";
    button.onclick = () => {
      console.log("Function content:", this.functionContent);
    };

    wrapper.appendChild(button);
    return wrapper;
  }
}

// Regular expression for matching {{variable}} pattern
const variableRegex = /{{([^}]+)}}/g;

// HTTP method names to match
const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

function createDecorations(view: EditorView) {
  const decorations: Range<Decoration>[] = [];
  const content = view.state.doc.toString();
  
  // Add variable decorations
  let match;
  while ((match = variableRegex.exec(content)) !== null) {
    const from = match.index;
    const to = from + match[0].length;
    const varName = match[1].trim();
    
    decorations.push({
      from,
      to,
      value: Decoration.mark({
        class: "cm-variable-highlight",
        attributes: {
          "data-variable": varName,
          onclick: `console.log('${varName}')`
        }
      })
    });
  }

  // Add HTTP method decorations
  const tree = syntaxTree(view.state);
  tree.iterate({
    enter: (node) => {
      const nodeText = view.state.doc.sliceString(node.from, node.to);
      
      // Check if the node contains any HTTP method
      const hasHttpMethod = httpMethods.some(method => nodeText.includes(method));
      
      if (hasHttpMethod && (
        node.type.name === "FunctionDeclaration" || 
        (node.type.name === "VariableDefinition" && nodeText.includes("=>"))
      )) {
        // Find the line start position
        let lineStart = node.from;
        while (lineStart > 0 && view.state.doc.sliceString(lineStart - 1, lineStart) !== "\n") {
          lineStart--;
        }
        
        decorations.push({
          from: lineStart,
          to: lineStart,
          value: Decoration.widget({
            widget: new RequestWidget(nodeText),
            side: -1,
            block: true
          })
        });
      }
    }
  });

  return Decoration.set(decorations);
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
    decorations: (v) => v.decorations,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.decorations || Decoration.none;
      })
  }
);