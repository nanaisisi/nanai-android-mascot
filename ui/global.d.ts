// Tauri's global bridge is injected at runtime and has no static package type.
// biome-ignore lint/suspicious/noExplicitAny: the runtime bridge is untyped
type TauriFunction = (...args: any[]) => any;

interface TauriApi {
	event?: {
		listen?: TauriFunction;
		emit?: TauriFunction;
	};
	core?: {
		invoke?: TauriFunction;
	};
	listen?: TauriFunction;
	emit?: TauriFunction;
	invoke?: TauriFunction;
}

declare var __TAURI__: TauriApi | undefined;
