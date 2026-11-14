// Tauri's global bridge is injected at runtime and has no static package type.
type TauriFunction = (...args: unknown[]) => unknown;

interface TauriApi {
	event?: {
		listen?: TauriFunction;
		emit?: TauriFunction;
	};
	core?: {
		invoke?: TauriFunction;
		convertFileSrc?: (url: string) => string;
	};
	listen?: TauriFunction;
	emit?: TauriFunction;
	invoke?: TauriFunction;
}

declare var __TAURI__: TauriApi | undefined;
declare var __TAURI_INTERNALS__: unknown | undefined;
declare var __TAURI_IPC__: unknown | undefined;

declare const __TARGET_PLATFORM__: "windows" | "android" | "web";
declare const __IS_WINDOWS__: boolean;
declare const __IS_ANDROID__: boolean;
