/**
 * @file shiori.ts
 * @brief SHIORI デバッグモード設定・再読み込みハンドラ
 */

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleSetShioriDebugMode(handler: any, args: string[]) {
	const mode = (args[2] ?? "").toLowerCase() === "true";
	if (handler.app.ghostController) {
		handler.app.ghostController.shioriDebugMode = mode;
	}
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleReloadShiori(handler: any, _args: string[]) {
	console.log("🔄 Execute reload,shiori triggered");
	if (handler.app.ghostController) {
		const ghost = handler.app.ghostController.currentGhost;
		if (ghost) {
			await handler.app.ghostController.initializeGhostSHIORI(ghost);
		}
	}
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleReloadShell(handler: any, _args: string[]) {
	console.log("🔄 Execute reload,shell triggered");
	const gc = handler.app.ghostController;
	if (gc?.currentGhost && gc?.currentShell) {
		await gc.selectShell?.(gc.currentShell);
	}
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleReloadGhost(handler: any, _args: string[]) {
	console.log("🔄 Execute reload,ghost triggered");
	const gc = handler.app.ghostController;
	const currentName = gc?.currentGhost?.name;
	if (gc && currentName) {
		await gc.switchGhost?.(currentName);
	}
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleReloadBalloon(handler: any, _args: string[]) {
	console.log("🔄 Execute reload,balloon triggered");
	const balloonTheme =
		handler.app.balloonTheme || handler.app.settings?.balloonTheme || "default";
	if (handler.app.setBalloonTheme) {
		await handler.app.setBalloonTheme(balloonTheme);
	}
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleReloadDescript(handler: any, _args: string[]) {
	console.log("🔄 Execute reload,descript triggered");
	const gc = handler.app.ghostController;
	const ghost = gc?.currentGhost;
	if (ghost) {
		await gc.initializeGhostSHIORI?.(ghost);
	}
	if (handler.app.balloonThemeManager?.resetDescript) {
		handler.app.balloonThemeManager.resetDescript();
	}
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleReloadSurface(handler: any, _args: string[]) {
	console.log("🔄 Execute reloadsurface triggered");
	const gc = handler.app.ghostController;
	if (gc?.currentGhost && gc?.currentShell) {
		const ghostPath = gc.currentGhost.path || "";
		await handler.app.surfaceManager?.loadSurfacesTxt?.(
			`${ghostPath}/shell/${gc.currentShell}`,
		);
	}
}
