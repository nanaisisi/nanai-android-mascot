/**
 * @file platform.ts
 * @description Platform detection and UI class branching utilities for Android / Desktop environments
 */

import { isTauriAvailable } from "../../../core/tauri-helper.js";
import { isAndroidPlatform } from "./overlay.js";

/**
 * プラットフォーム実行モード識別子
 */
export type PlatformMode =
	| "android-native"
	| "android-web"
	| "desktop-native"
	| "desktop-web";

/**
 * 現在の実行環境のプラットフォームモードを詳細判定
 */
export function detectPlatformMode(): PlatformMode {
	const android = isAndroidPlatform();
	const tauri = isTauriAvailable();

	if (android) {
		return tauri ? "android-native" : "android-web";
	}
	return tauri ? "desktop-native" : "desktop-web";
}

/**
 * DOM要素またはdocument.bodyにプラットフォームUI分岐用CSSクラスを付与/同期
 */
export function applyPlatformUiClasses(targetElement?: unknown): PlatformMode {
	const mode = detectPlatformMode();
	const target =
		(targetElement as HTMLElement) ||
		(typeof document !== "undefined" ? document.body : null);

	if (!target?.classList) {
		return mode;
	}

	const isAndroid = mode.startsWith("android");
	const isNative = mode.endsWith("-native");

	target.classList.toggle("is-android-device", isAndroid);
	target.classList.toggle("is-desktop-device", !isAndroid);
	target.classList.toggle("is-native-android", mode === "android-native");
	target.classList.toggle("is-web-android", mode === "android-web");
	target.classList.toggle("is-native-runtime", isNative);
	target.classList.toggle("is-web-runtime", !isNative);

	return mode;
}
