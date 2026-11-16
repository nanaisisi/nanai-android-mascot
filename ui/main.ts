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
	try {
		const appInstance = new NanaiAndroidMascotApp();
		(window as unknown as { app: NanaiAndroidMascotApp }).app = appInstance;
		(globalThis as unknown as { mascotApp: NanaiAndroidMascotApp }).mascotApp = appInstance;
		console.log("✨ [main.ts] NanaiAndroidMascotApp successfully instantiated");
	} catch (err) {
		console.error("💥 [main.ts] Failed to instantiate NanaiAndroidMascotApp:", err);
	}
}
