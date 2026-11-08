/**
 * @file window.ts
 * @brief ウィンドウ状態およびデスクトップ整列コマンドハンドラ
 */

<<<<<<< HEAD
export async function handleWindowState(state: string, handler?: unknown) {
	try {
		const api = (globalThis as unknown).__TAURI__?.window;
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleWindowState(state: string, handler?: any) {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const api = (globalThis as any).__TAURI__?.window;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		if (!api) return;
		const win = api.getCurrentWindow();
		const lower = state.toLowerCase();
		const gc = handler?.app?.ghostController;
		if (lower === "stayontop") {
			await win.setAlwaysOnTop(true);
		} else if (lower === "!stayontop") {
			await win.setAlwaysOnTop(false);
		} else if (lower === "minimize") {
			await win.minimize();
			if (gc?.sendShioriEvent) {
				await gc.sendShioriEvent("OnWindowStateMinimize", []);
			}
		} else if (lower === "restore") {
			if (win.unminimize) {
				await win.unminimize();
			} else if (win.show) {
				await win.show();
			}
			if (gc?.sendShioriEvent) {
				await gc.sendShioriEvent("OnWindowStateRestore", []);
			}
		}
	} catch (e) {
		console.warn("windowstate 失敗:", e);
	}
}

<<<<<<< HEAD
export async function setAlignmentToDesktop(handler: unknown, mode: string) {
	handler.app.alignmentToDesktop = mode;
	if (mode === "free") return;
	try {
		const api = (globalThis as unknown).__TAURI__?.window;
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function setAlignmentToDesktop(handler: any, mode: string) {
	handler.app.alignmentToDesktop = mode;
	if (mode === "free") return;
	try {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const api = (globalThis as any).__TAURI__?.window;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
		console.warn("alignmenttodesktop 失敗:", e);
	}
}
