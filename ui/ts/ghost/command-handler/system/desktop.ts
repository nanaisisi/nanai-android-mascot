/**
 * @file desktop.ts
 * @brief デスクトップ整列・タスクトレイ・ウィンドウ位置操作コマンドハンドラ
 */

import { invoke, isTauriAvailable } from "../../../core/tauri-helper.js";

export async function handleSetAlignmentOnDesktop(
	handler: any,
	args: string[],
) {
	const mode = (args[2] ?? "").toLowerCase();
	handler.app.alignmentToDesktop = mode;
	if (mode === "free") return;

	try {
		const api = (globalThis as any).__TAURI__?.window;
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

export async function handleSetTaskTrayIcon(_handler: any, args: string[]) {
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

export async function handleSetTrayBalloon(handler: any, args: string[]) {
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
	if (handler?.app?.ghostController?.sendShioriEvent) {
		const timeoutMs = Number.parseInt(iconOrTimeout ?? "10000", 10) || 10000;
		setTimeout(() => {
			handler.app.ghostController
				?.sendShioriEvent?.("OnTrayBalloonTimeout", [title, text])
				?.catch(() => {});
		}, timeoutMs);
	}
}

export async function triggerTrayBalloonClick(
	handler: any,
	title: string = "",
	text: string = "",
) {
	if (handler?.app?.ghostController?.sendShioriEvent) {
		await handler.app.ghostController.sendShioriEvent("OnTrayBalloonClick", [
			title,
			text,
		]);
	}
}

export async function handleExecuteResetWindowPos(
	handler: any,
	_args: string[],
) {
	console.log("📍 Execute resetwindowpos triggered");
	await handler.app.dispatchAction?.("reset-shell-position");
	if (handler.app.ghostController?.sendShioriEvent) {
		await handler.app.ghostController.sendShioriEvent("OnResetWindowPos", [
			"shell",
		]);
	}
}

export async function handleExecuteResetBalloonPos(
	handler: any,
	_args: string[],
) {
	console.log("🎈 Execute resetballoonpos triggered");
	await handler.app.dispatchAction?.("reset-balloon-position");
	if (handler.app.ghostController?.sendShioriEvent) {
		await handler.app.ghostController.sendShioriEvent("OnResetWindowPos", [
			"balloon",
		]);
	}
}
