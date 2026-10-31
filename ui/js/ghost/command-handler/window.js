export async function handleWindowState(state) {
	try {
		const api = globalThis.__TAURI__?.window;
		if (!api) return;
		const win = api.getCurrentWindow();
		const lower = state.toLowerCase();
		if (lower === "stayontop") {
			await win.setAlwaysOnTop(true);
		} else if (lower === "!stayontop") {
			await win.setAlwaysOnTop(false);
		} else if (lower === "minimize") {
			await win.minimize();
		}
	} catch (e) {
		console.warn("windowstate 失敗:", e);
	}
}

export async function setAlignmentToDesktop(handler, mode) {
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
		console.warn("alignmenttodesktop 失敗:", e);
	}
}
