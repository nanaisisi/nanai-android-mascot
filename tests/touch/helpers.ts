/**
 * テスト用モック要素作成ヘルパー
 */
export interface MockTouchEvent {
	type?: string;
	touches?: Array<{ clientX: number; clientY: number }>;
	changedTouches?: Array<{ clientX: number; clientY: number }>;
	preventDefault?: () => void;
	[key: string]: unknown;
}

export function createMockElement() {
	const listeners: Record<string, EventListener[]> = {};
	return {
		listeners,
		addEventListener(event: string, fn: EventListener) {
			if (!listeners[event]) listeners[event] = [];
			listeners[event].push(fn);
		},
		removeEventListener(event: string, fn: EventListener) {
			if (!listeners[event]) return;
			listeners[event] = listeners[event].filter((f) => f !== fn);
		},
		dispatchEvent(event: MockTouchEvent, type?: string) {
			const eventType = type || event.type;
			if (!eventType) return;
			const fns = listeners[eventType] || [];
			for (const fn of fns) {
				fn(event as unknown as Event);
			}
		},
	};
}
