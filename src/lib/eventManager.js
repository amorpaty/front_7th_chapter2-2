// WeakMap을 사용하여 element별로 이벤트 핸들러를 저장
// WeakMap: element가 DOM에서 제거되면 자동으로 가비지 컬렉션됨
const eventHandlers = new WeakMap();

export function setupEventListeners(root) {
  // root에 이미 이벤트 리스너가 설정되어 있는지 확인
  if (root.__eventListenersSetup) {
    return;
  }

  // 모든 이벤트 타입에 대해 위임 리스너 설정
  const eventTypes = [
    "click",
    "input",
    "change",
    "submit",
    "keydown",
    "keyup",
    "focus",
    "blur",
    "mouseover",
    "mouseout",
    "mouseenter",
    "mouseleave",
  ];

  eventTypes.forEach((eventType) => {
    root.addEventListener(
      eventType,
      (e) => {
        // 이벤트가 발생한 요소부터 root까지 탐색 (이벤트 버블링 활용)
        let target = e.target;

        while (target && target !== root) {
          const handlers = eventHandlers.get(target);

          if (handlers && handlers[eventType]) {
            // 해당 요소에 등록된 핸들러 실행
            handlers[eventType].forEach((handler) => {
              handler(e);
            });
          }

          target = target.parentElement;
        }
      },
      false, // useCapture: false로 설정하여 버블링 단계에서 처리
    );
  });

  // 설정 완료 표시
  root.__eventListenersSetup = true;
}

export function addEvent(element, eventType, handler) {
  // element에 대한 핸들러 맵이 없으면 생성
  if (!eventHandlers.has(element)) {
    eventHandlers.set(element, {});
  }

  const handlers = eventHandlers.get(element);

  // 해당 eventType에 대한 핸들러 배열이 없으면 생성
  if (!handlers[eventType]) {
    handlers[eventType] = [];
  }

  // 핸들러 추가 (중복 방지)
  if (!handlers[eventType].includes(handler)) {
    handlers[eventType].push(handler);
  }
}

export function removeEvent(element, eventType, handler) {
  const handlers = eventHandlers.get(element);

  if (handlers && handlers[eventType]) {
    // 핸들러 배열에서 해당 핸들러 제거
    handlers[eventType] = handlers[eventType].filter((h) => h !== handler);

    // 배열이 비었으면 삭제
    if (handlers[eventType].length === 0) {
      delete handlers[eventType];
    }
  }
}
