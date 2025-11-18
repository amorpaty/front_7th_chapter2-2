export function normalizeVNode(vNode) {
  console.log("normalizeVNode 호출:", vNode);

  // null, undefined, boolean 값은 빈 문자열로 변환
  if (vNode == null || typeof vNode === "boolean") {
    return "";
  }

  // 문자열과 숫자는 문자열로 변환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode).filter((child) => child !== "");
  }

  const { type, props, children } = vNode;

  // 함수형 컴포넌트인 경우 실행 후 재귀적으로 정규화
  if (typeof type === "function") {
    const componentProps = { ...props };
    if (children && children.length > 0) {
      componentProps.children = children;
    }
    const rendered = type(componentProps);
    return normalizeVNode(rendered);
  }

  console.log("일반 HTML 요소 처리:", vNode);

  return {
    type,
    props: props || null,
    children: children.map(normalizeVNode).filter((child) => child !== ""),
  };
}
