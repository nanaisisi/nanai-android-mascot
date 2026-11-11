// Tauri's global bridge is injected at runtime and has no static package type.
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
declare var __TAURI_INTERNALS__: any | undefined;
declare var __TAURI_IPC__: any | undefined;
