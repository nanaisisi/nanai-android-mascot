/**
 * @file main.ts
 * @brief Nanai Android Mascot メインアプリケーションエントリーポイント (UKADOC / SSP仕様準拠)
 */
import { NanaiAndroidMascotApp } from "./ts/core/app/lifecycle.js";
export * from "./ts/core/app/types.js";
export { NanaiAndroidMascotApp };

declare global {
	var mascotApp: NanaiAndroidMascotApp | undefined;
}

if (typeof window !== "undefined") {
	(window as unknown as { app: NanaiAndroidMascotApp }).app =
		new NanaiAndroidMascotApp();
	(globalThis as unknown as { mascotApp: NanaiAndroidMascotApp }).mascotApp = (
		window as unknown as { app: NanaiAndroidMascotApp }
	).app;
}
