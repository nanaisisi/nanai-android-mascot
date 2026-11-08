// Tauri's global bridge is injected at runtime and has no static package type.
type TauriFunction = (...args: unknown[]) => unknown;

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
