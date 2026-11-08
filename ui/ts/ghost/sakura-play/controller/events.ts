/**
 * @file events.ts
 * @brief SakuraPlaybackController 向けイベントリスナー管理・発行ロジック
 */


type ListenerFn = (...args: unknown[]) => void;
type ControllerWithListeners = {
	listeners: Map<string, Set<ListenerFn>>;
	off: (event: string, handler: ListenerFn) => void;
};

export function on(
	this: unknown,
	event: string,
	_handler: ListenerFn,
): () => void {
	const self = this as ControllerWithListeners;
	if (!self.listeners.has(event)) {
		self.listeners.set(event, new Set());



export function _on(this: any, event: string, handler: Function): () => void {
	if (!this.listeners.has(event)) {
		this.listeners.set(event, new Set());

	}
	self.listeners.get(event)?.add(handler);
	return () => self.off(event, handler);
}


export function _off(this: unknown, event: string, _handler: ListenerFn) {
	const self = this as ControllerWithListeners;
	const _handlers = self.listeners.get(event);



export function _off(this: any, event: string, handler: Function) {
	const handlers = this.listeners.get(event);

	if (handlers) {
		handlers.delete(handler);
		if (handlers.size === 0) {
			self.listeners.delete(event);
		}
	}
}


export function _emit(this: unknown, event: string, ...args: unknown[]) {
	const self = this as ControllerWithListeners;
	const handlers = self.listeners.get(event);
	if (handlers) {
		for (const handler of Array.from(handlers)) {
			try {
				handler(...args);


export function _emit(this: any, event: string, ...args: any[]) {
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
