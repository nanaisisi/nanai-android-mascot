/**
 * @file sakura-play-sync.ts
 * @brief さくらスクリプト再生時の独立バルーンウィンドウ同期ヘルパー
 */

import type { NanaiAndroidMascotApp } from "../../main.js";
import {
	emit,
	invoke,
	isNativeMultiWindow,
	isTauriAvailable,
} from "../core/tauri-helper.js";
import type { SakuraPlaybackController } from "./sakura-play/controller.js";
import type { SakuraScriptPlayer } from "./sakura-script.js";

type PlayTarget = SakuraScriptPlayer | SakuraPlaybackController;

export function createBalloonSyncManager(
	player: PlayTarget,
	app: NanaiAndroidMascotApp,
	sakuraText: HTMLElement | null | undefined,
	keroText: HTMLElement | null | undefined,
) {
	const syncPendingScopes = new Set<number>();
	let syncQueued = false;

	const flushDesktopBalloon = () => {
		syncQueued = false;
		if (syncPendingScopes.size > 0 && isTauriAvailable()) {
			for (const sc of syncPendingScopes) {
				const htmlContent = (sc === 1 ? keroText : sakuraText)?.innerHTML || "";
				if (isNativeMultiWindow() && htmlContent.trim().length > 0) {
					void invoke("show_balloon_window", {
						scope_id: sc,
						theme: app.currentBalloonTheme || "default",
					}).catch(() => {});
				}
				void emit(`update-balloon-content-${sc}`, {
					html: htmlContent,
					theme: app.currentBalloonTheme || "default",
				});
			}
			syncPendingScopes.clear();
		}
	};

	const scheduleDesktopBalloonSync = (
		immediate: boolean = false,
		targetScope?: number | null,
	) => {
		if (!isTauriAvailable()) return;
		const sc = targetScope ?? player.currentScope;
		syncPendingScopes.add(sc);
		if (immediate) {
			flushDesktopBalloon();
			return;
		}
		if (!syncQueued) {
			syncQueued = true;
			queueMicrotask(flushDesktopBalloon);
		}
	};

	return {
		flushDesktopBalloon,
		scheduleDesktopBalloonSync,
	};
}
