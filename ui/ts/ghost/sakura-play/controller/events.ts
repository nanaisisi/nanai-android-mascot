/**
 * @file events.ts
 * @brief SakuraPlaybackController 向けイベントリスナー管理・発行ロジック
 */

export function on(this: any, event: string, handler: Function): () => void {
	if (!this.listeners.has(event)) {
		this.listeners.set(event, new Set());
	}
	this.listeners.get(event).add(handler);
	return () => this.off(event, handler);
}

export function off(this: any, event: string, handler: Function) {
	const handlers = this.listeners.get(event);
	if (handlers) {
		handlers.delete(handler);
		if (handlers.size === 0) {
			this.listeners.delete(event);
		}
	}
}

export function emit(this: any, event: string, ...args: any[]) {
	const handlers = this.listeners.get(event);
	if (handlers) {
		for (const handler of Array.from(handlers)) {
			try {
				(handler as Function)(...args);
			} catch (err) {
				console.error(
					`Error in SakuraPlaybackController event '${event}':`,
					err,
				);
			}
		}
	}
}
