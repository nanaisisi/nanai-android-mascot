/**
 * @file events.ts
 * @brief SakuraPlaybackController 向けイベントリスナー管理・発行ロジック
 */

export function on(
	this: unknown,
	event: string,
	handler: (...args: unknown[]) => unknown,
): () => void {
	const self = this as {
		listeners: Map<string, Set<(...args: unknown[]) => unknown>>;
		off: (e: string, h: (...args: unknown[]) => unknown) => void;
	};
	if (!self.listeners.has(event)) {
		self.listeners.set(event, new Set());
	}
	self.listeners.get(event)?.add(handler);
	return () => self.off(event, handler);
}

export function off(
	this: unknown,
	event: string,
	handler: (...args: unknown[]) => unknown,
) {
	const self = this as {
		listeners: Map<string, Set<(...args: unknown[]) => unknown>>;
	};
	const handlers = self.listeners.get(event);
	if (handlers) {
		handlers.delete(handler);
		if (handlers.size === 0) {
			self.listeners.delete(event);
		}
	}
}

export function emit(this: unknown, event: string, ...args: unknown[]) {
	const self = this as {
		listeners: Map<string, Set<(...args: unknown[]) => unknown>>;
	};
	const handlers = self.listeners.get(event);
	if (handlers) {
		for (const handler of Array.from(handlers)) {
			try {
				handler(...args);
			} catch (err) {
				console.error(
					`Error in SakuraPlaybackController event '${event}':`,
					err,
				);
			}
		}
	}
}
