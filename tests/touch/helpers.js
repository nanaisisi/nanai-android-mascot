/**
 * テスト用モック要素作成ヘルパー
 */
export function createMockElement() {
	const listeners = {};
	return {
		listeners,
		addEventListener(event, fn) {
			if (!listeners[event]) listeners[event] = [];
			listeners[event].push(fn);
		},
		removeEventListener(event, fn) {
			if (!listeners[event]) return;
			listeners[event] = listeners[event].filter((f) => f !== fn);
		},
		dispatchEvent(event, type) {
			const eventType = type || event.type;
			const fns = listeners[eventType] || [];
			for (const fn of fns) {
				fn(event);
			}
		},
	};
}
