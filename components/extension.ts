import { Environment } from "@/hooks/use-workspace";
import {
  Decoration,
  DecorationSet,
  EditorView,
  KeyBinding, keymap, MatchDecorator,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { MouseEvent as ReactMouseEvent } from "react";

export type DecoratorFn = (source: string) => void;

const VARIABLE_PLACEHOLDER_REGEX = /\{\{([A-Z_]+)\}\}/g;
const VARIABLE_DECORATOR_SELECTOR = "cm-env-variable";

type GetEnvironment = () => Environment | null;

type DecoratorEvent =
  | "deco:toDom"
  | "deco:updateDom"
  | "deco:destroy"
  | "deco:click";

export type DecoratorListener = (event: CustomEvent<string>) => void;

export function subscribe(
  eventName: DecoratorEvent,
  listener: DecoratorListener
) {
  document.addEventListener(eventName, listener as EventListener);
}

export function unsubscribe(
  eventName: DecoratorEvent,
  listener: DecoratorListener
) {
  document.removeEventListener(eventName, listener as EventListener);
}

export function publish(eventName: DecoratorEvent, data: any) {
  const event = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(event);
}

class VariableWidget extends WidgetType {
  private clickHandler: (e: MouseEvent) => void;
  private mouseOverHandler: (e: MouseEvent) => void;
  private mouseOutHandler: (e: MouseEvent) => void;

  constructor(
    /** value of matched decorator range */
    private varName: string,
    private getEnvironment: GetEnvironment,
    /**
     * forces the editor to update it's internal state by force re-rendering this decoration.
     */
    private version: number
  ) {
    super();

    // Note: updateDOM does not remove the click event listeners properly unless called with a normal function (not arrow)
    this.clickHandler = function (e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();

      let ev = e as unknown as ReactMouseEvent<HTMLSpanElement>;
      let evContent = ev.currentTarget.innerText;

      publish("deco:click", evContent?.trim());
    };

    this.mouseOverHandler = function (e) {
      const target = e.currentTarget as HTMLElement;

      if (target.classList.contains(VARIABLE_DECORATOR_SELECTOR)) {
        const varValue = target.dataset.var_value;

        const existingTooltip = document.querySelector(".env-var-tooltip");
        if (existingTooltip) {
          existingTooltip.remove();
        }

        const tooltip = document.createElement("div");
        tooltip.className = "env-var-tooltip";
        tooltip.textContent = `${varValue ? varValue : "Missing value"}`;

        Object.assign(tooltip.style, {
          position: "absolute",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: "1000",
        });

        // Position tooltip
        const rect = target.getBoundingClientRect();
        tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
        tooltip.style.left = `${rect.left + window.scrollX}px`;

        document.body.appendChild(tooltip);
      }
    };

    this.mouseOutHandler = function (e) {
      const target = e.currentTarget as HTMLElement;
      if (target.classList.contains(VARIABLE_DECORATOR_SELECTOR)) {
        const tooltip = document.querySelector(".env-var-tooltip");
        if (tooltip) {
          tooltip.remove();
        }
      }
    };
  }

  eq(other: WidgetType): boolean {
    return (
      other instanceof VariableWidget &&
      this.varName === other.varName &&
      this.version === other.version
    );
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement("span");

    const leftPad = document.createElement("span");
    const content = document.createElement("span");
    const rightPad = document.createElement("span");

    const value = this.getVariableValue();

    // Setup padding spans with real spaces
    leftPad.innerHTML = "&nbsp;";
    rightPad.innerHTML = "&nbsp;";

    // Content span
    content.textContent = this.varName;
    content.dataset.role = "content";

    wrapper.className = this.styleDecorator(value);

    wrapper.dataset.var_name = this.varName;
    wrapper.dataset.var_value = value || "";

    wrapper.addEventListener("click", this.clickHandler);
    wrapper.addEventListener("mouseover", this.mouseOverHandler);
    wrapper.addEventListener("mouseout", this.mouseOutHandler);

    wrapper.appendChild(leftPad);
    wrapper.appendChild(content);
    wrapper.appendChild(rightPad);

    return wrapper;
  }

  updateDOM(wrapper: HTMLElement, _: EditorView): boolean {
    const content = wrapper.querySelector(
      '[data-role="content"]'
    ) as HTMLElement;

    const value = this.getVariableValue();

    content.textContent = this.varName;
    wrapper.className = this.styleDecorator(value);

    wrapper.dataset.var_name = this.varName;
    wrapper.dataset.var_value = value || "";

    return true;
  }

  destroy(wrapper: HTMLElement): void {
    wrapper.removeEventListener("click", this.clickHandler);
    wrapper.removeEventListener("mouseover", this.mouseOverHandler);
    wrapper.removeEventListener("mouseout", this.mouseOutHandler);
  }

  ignoreEvent(): boolean {
    return false;
  }

  private styleDecorator(value: string | undefined): string {
    return `${VARIABLE_DECORATOR_SELECTOR} rounded-[2px] text-xs cursor-pointer outline outline-1 ${
      value
        ? "bg-primary/20 outline-white/70 dark:bg-primary/80 dark:outline-white/40"
        : "bg-red-500/50 outline-white/70 dark:outline-white/40"
    }`;
  }

  private getVariableValue(): string | undefined {
    return this.getEnvironment()?.variables?.find((v) => v.key === this.varName)
      ?.value;
  }
}

const variablesMatcher = (getEnvironment: GetEnvironment, version: number) => {
  return new MatchDecorator({
    regexp: VARIABLE_PLACEHOLDER_REGEX,
    decoration: (match) =>
      Decoration.replace({
        widget: new VariableWidget(match[1], getEnvironment, version),
        side: 1,
      }),
  });
};

export const variables = (getEnvironment: GetEnvironment, version: number) =>
  ViewPlugin.fromClass(
    class {
      placeholders: DecorationSet;
      constructor(view: EditorView) {
        this.placeholders = variablesMatcher(
          getEnvironment,
          version
        ).createDeco(view);
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.viewportChanged ||
          update.transactions.some((t) => t.effects.length > 0)
        ) {
          this.placeholders = variablesMatcher(
            getEnvironment,
            version
          ).updateDeco(update, this.placeholders);
        }
      }
    },
    {
      decorations: (instance) => instance.placeholders,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.placeholders || Decoration.none;
        }),
    }
  );

/**
 * Keymap extension that lifts cursor out of a range (variable range) on spacebar press.
 * It is used to lift cursor out of variable decorator.
 */
export function liftCursor() {
  const binding: KeyBinding = {
    key: " ",
    preventDefault: false,
    run(view: EditorView) {
      const state = view.state;
      const { from } = state.selection.main;
      const line = state.doc.lineAt(from);
      const lineText = line.text;
      const lineStart = line.from;

      let regex = VARIABLE_PLACEHOLDER_REGEX;

      let match: RegExpExecArray | null;
      regex.lastIndex = 0; // Reset regex state (important for global regexes)

      while ((match = regex.exec(lineText)) !== null) {
        const matchStart = lineStart + match.index;
        const matchEnd = matchStart + match[0].length;

        if (from > matchStart && from < matchEnd) {
          // Cursor is inside the matched range
          view.dispatch({
            changes: {
              from: matchEnd,
              to: matchEnd,
              insert: " ",
            },
            selection: { anchor: matchEnd + 1 },
          });
          return true;
        }
      }

      return false;
    },
  };

  return keymap.of([binding]);
}
