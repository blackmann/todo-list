import type { Root } from 'hast';
import type { Plugin } from "unified";
import { visit } from 'unist-util-visit';

export const rehypeCheckbox: Plugin<[], Root> = () => {
  return (tree) => {
    let checkboxId = 0
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName === "input" && node.properties?.type === "checkbox") {
        node.properties.className = [
          ...(node.properties.className || []),
          "form-checkbox",
          "rounded",
          "border-gray-300",
          "dark:border-gray-600",
          "focus:ring-blue-500",
          "dark:focus:ring-blue-400",
        ];

        node.properties.id = `_checkbox-${checkboxId++}`;
        node.properties.disabled = undefined
        node.properties['data-task-line'] = parent?.position?.start?.line;
      }
    });
  };
}