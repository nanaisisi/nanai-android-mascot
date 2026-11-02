/**
 * @file events.js
 * @brief SakuraPlaybackController 向けイベントリスナー管理・発行ロジック
 */

/**
 * イベントリスナーの登録
 * @param {string} event
 * @param {Function} handler
 * @returns {() => void} リスナー解除関数
 */
export function on(event, handler) {
	if (!this.listeners.has(event)) {
		this.listeners.set(event, new Set());
	}
	this.listeners.get(event).add(handler);
	return () => this.off(event, handler);
}

/**
 * イベントリスナーの解除
 * @param {string} event
 * @param {Function} handler
 */
export function off(event, handler) {
	const handlers = this.listeners.get(event);
	if (handlers) {
		handlers.delete(handler);
		if (handlers.size === 0) {
			this.listeners.delete(event);
		}
	}
}

/**
 * イベントの発行
 * @param {string} event
 * @param {...any} args
 */
export function emit(event, ...args) {
	const handlers = this.listeners.get(event);
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
