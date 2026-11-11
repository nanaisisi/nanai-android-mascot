/**
 * @file sakura-play-sync.ts
 * @brief さくらスクリプト再生時の独立バルーンウィンドウ同期ヘルパー
 */

import type { NanaiAndroidMascotApp } from "../../main.js";
import { emit, isTauriAvailable } from "../core/tauri-helper.js";
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
				emit(`update-balloon-content-${sc}`, {
					html: (sc === 1 ? keroText : sakuraText)?.innerHTML || "",
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
