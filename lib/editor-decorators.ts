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
    const button = document.createElement("button");
    button.textContent = "Send request";
    button.className = "cm-request-button";
    button.onclick = () => {
      console.log("Function content:", this.functionContent);
    };
    return button;
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
      if (node.type.name === "FunctionDeclaration" || node.type.name === "VariableDefinition") {
        const functionText = view.state.doc.sliceString(node.from, node.to);
        for (const method of httpMethods) {
          if (functionText.includes(method)) {
            decorations.push({
              from: node.from,
              to: node.from,
              value: Decoration.widget({
                widget: new RequestWidget(functionText),
                side: -1
              })
            });
            break;
          }
        }
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