import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  // Remove old attributes and event handlers
  Object.keys(oldProps).forEach((key) => {
    if (!(key in newProps)) {
      if (key.startsWith("on") && typeof oldProps[key] === "function") {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(target, eventType);
      } else if (key === "className" || key === "classname") {
        target.removeAttribute("class");
      } else {
        target.removeAttribute(key);
      }
    }
  });

  // Update or add new attributes and event handlers
  Object.keys(newProps).forEach((key) => {
    if (newProps[key] !== oldProps[key]) {
      if (key.startsWith("on") && typeof newProps[key] === "function") {
        const eventType = key.slice(2).toLowerCase();
        // Remove old handler if exists
        if (oldProps[key]) {
          removeEvent(target, eventType);
        }
        // Add new handler
        addEvent(target, eventType, newProps[key]);
      } else if (key === "className" || key === "classname") {
        target.setAttribute("class", newProps[key]);
      } else if (typeof newProps[key] === "boolean") {
        if (newProps[key]) {
          target.setAttribute(key, "");
        } else {
          target.removeAttribute(key);
        }
      } else if (newProps[key] != null) {
        target.setAttribute(key, newProps[key]);
      }
    }
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // If oldNode doesn't exist, add newNode
  if (!oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  const targetElement = parentElement.childNodes[index];

  // If newNode doesn't exist, remove oldNode
  if (!newNode) {
    if (targetElement) {
      parentElement.removeChild(targetElement);
    }
    return;
  }

  // If both are text nodes or simple values
  if (typeof newNode === "string" || typeof newNode === "number") {
    if (typeof oldNode === "string" || typeof oldNode === "number") {
      if (newNode !== oldNode && targetElement) {
        targetElement.nodeValue = String(newNode);
      }
      return;
    }
  }

  // If node types are different, replace the entire node
  if (newNode.type !== oldNode.type) {
    if (targetElement) {
      parentElement.replaceChild(createElement(newNode), targetElement);
    }
    return;
  }

  // Same node type - update attributes and children
  if (targetElement && targetElement.nodeType === 1) {
    updateAttributes(targetElement, newNode.props || {}, oldNode.props || {});

    // Update children recursively
    const newChildren = newNode.children || [];
    const oldChildren = oldNode.children || [];
    const maxLength = Math.max(newChildren.length, oldChildren.length);

    for (let i = 0; i < maxLength; i++) {
      updateElement(targetElement, newChildren[i], oldChildren[i], i);
    }
  }
}
