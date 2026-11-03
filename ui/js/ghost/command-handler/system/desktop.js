/**
 * @file desktop.js
 * @brief デスクトップ整列・タスクトレイ・ウィンドウ位置操作コマンドハンドラ
 */

import { invoke, isTauriAvailable } from "../../../core/tauri-helper.js";

/**
 * デスクトップ整列位置を設定 (\![set,alignmentondesktop,...])
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleSetAlignmentOnDesktop(handler, args) {
	const mode = (args[2] ?? "").toLowerCase();
	handler.app.alignmentToDesktop = mode;
	if (mode === "free") return;

	try {
		const api = globalThis.__TAURI__?.window;
		if (!api) return;
		const win = api.getCurrentWindow();
		const monitor = await api.currentMonitor();
		if (!monitor) return;
		const size = await win.outerSize();
		const pos = await win.outerPosition();
		const { x: mx, y: my } = monitor.position;
		const { width: mw, height: mh } = monitor.size;
		let x = pos.x;
		let y = pos.y;
		if (mode === "bottom") y = my + mh - size.height;
		else if (mode === "top") y = my;
		else if (mode === "left") x = mx;
		else if (mode === "right") x = mx + mw - size.width;
		await win.setPosition(new api.PhysicalPosition(x, y));
	} catch (e) {
		console.warn("alignmentondesktop 失敗:", e);
	}
}

/**
 * タスクトレイアイコン設定 (\![set,tasktrayicon,...])
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} _handler
 * @param {string[]} args
 */
export async function handleSetTaskTrayIcon(_handler, args) {
	const iconPath = args[2] ?? "";
	console.log(`📌 Task tray icon set: ${iconPath}`);
	if (isTauriAvailable()) {
		try {
			await invoke("set_tray_icon", { iconPath });
		} catch (err) {
			console.warn("set_tray_icon failed:", err);
		}
	}
}

/**
 * トレイバルーン表示通知 (\![set,trayballoon,...])
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleSetTrayBalloon(handler, args) {
	const title = args[2] ?? "";
	const text = args[3] ?? "";
	const iconOrTimeout = args[4];
	console.log(`💬 Tray balloon notification: title=${title}, text=${text}`);
	if (isTauriAvailable()) {
		try {
			await invoke("show_tray_notification", { title, text });
		} catch (err) {
			console.warn("show_tray_notification failed:", err);
		}
	}
	// UKADOCトレイバルーンイベント連携: OnTrayBalloonClick, OnTrayBalloonTimeout
	if (handler?.app?.ghostController?.sendShioriEvent) {
		const timeoutMs = Number.parseInt(iconOrTimeout ?? "10000", 10) || 10000;
		// コールバック機構またはタイムアウト通知用タイマー
		setTimeout(() => {
			handler.app.ghostController
				?.sendShioriEvent?.("OnTrayBalloonTimeout", [title, text])
				?.catch(() => {});
		}, timeoutMs);
	}
}

/**
 * トレイバルーンクリックイベント発火ハンドラ
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string} [title=""]
 * @param {string} [text=""]
 */
export async function triggerTrayBalloonClick(handler, title = "", text = "") {
	if (handler?.app?.ghostController?.sendShioriEvent) {
		await handler.app.ghostController.sendShioriEvent("OnTrayBalloonClick", [
			title,
			text,
		]);
	}
}

/**
 * シェル位置初期化 (\![execute,resetwindowpos])
 * [bang-execute-resetwindowpos.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} _args
 */
export async function handleExecuteResetWindowPos(handler, _args) {
	console.log("📍 Execute resetwindowpos triggered");
	await handler.app.dispatchAction?.("reset-shell-position");
	if (handler.app.ghostController?.sendShioriEvent) {
		await handler.app.ghostController.sendShioriEvent("OnResetWindowPos", [
			"shell",
		]);
	}
}

/**
 * バルーン位置初期化 (\![execute,resetballoonpos])
 * [bang-execute-resetballoonpos.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} _args
 */
export async function handleExecuteResetBalloonPos(handler, _args) {
	console.log("🎈 Execute resetballoonpos triggered");
	await handler.app.dispatchAction?.("reset-balloon-position");
	if (handler.app.ghostController?.sendShioriEvent) {
		await handler.app.ghostController.sendShioriEvent("OnResetWindowPos", [
			"balloon",
		]);
	}
}
