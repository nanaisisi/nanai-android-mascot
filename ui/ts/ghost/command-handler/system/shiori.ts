/**
 * @file shiori.ts
 * @brief SHIORI デバッグモード設定・再読み込みハンドラ
 */

export async function handleSetShioriDebugMode(
	handler: import("../../sakura-command-handler.js").SakuraCommandHandler,
	args: string[],
) {
	const mode = (args[2] ?? "").toLowerCase() === "true";
	if (handler.app.ghostController) {
		handler.app.ghostController.shioriDebugMode = mode;
	}
}

export async function handleReloadShiori(
	handler: import("../../sakura-command-handler.js").SakuraCommandHandler,
	_args: string[],
) {
	console.log("🔄 Execute reload,shiori triggered");
	if (handler.app.ghostController) {
		const ghost = handler.app.ghostController.currentGhost;
		if (ghost) {
			await handler.app.ghostController.initializeGhostSHIORI(ghost);
		}
	}
}

export async function handleReloadShell(
	handler: import("../../sakura-command-handler.js").SakuraCommandHandler,
	_args: string[],
) {
	console.log("🔄 Execute reload,shell triggered");
	const gc = handler.app.ghostController;
	if (gc?.currentGhost && gc?.currentShell) {
		await gc.selectShell?.(gc.currentShell);
	}
}

export async function handleReloadGhost(
	handler: import("../../sakura-command-handler.js").SakuraCommandHandler,
	_args: string[],
) {
	console.log("🔄 Execute reload,ghost triggered");
	const gc = handler.app.ghostController;
	const currentName = gc?.currentGhost?.name;
	if (gc && currentName) {
		const selectFn =
			gc.selectGhost ||
			(gc as { switchGhost?: (name: string) => Promise<unknown> }).switchGhost;
		if (selectFn) {
			await selectFn.call(gc, currentName);
		}
	}
}

export async function handleReloadBalloon(
	handler: import("../../sakura-command-handler.js").SakuraCommandHandler,
	_args: string[],
) {
	console.log("🔄 Execute reload,balloon triggered");
	const balloonTheme =
		handler.app.balloonTheme || handler.app.settings?.balloonTheme || "default";
	if (handler.app.setBalloonTheme) {
		await handler.app.setBalloonTheme(balloonTheme);
	}
}

export async function handleReloadDescript(
	handler: import("../../sakura-command-handler.js").SakuraCommandHandler,
	_args: string[],
) {
	console.log("🔄 Execute reload,descript triggered");
	const gc = handler.app.ghostController;
	const ghost = gc?.currentGhost;
	if (ghost) {
		await gc.initializeGhostSHIORI?.(ghost);
	}
	const btm = handler.app.balloonThemeManager as
		| { resetDescript?: () => void }
		| undefined;
	if (btm?.resetDescript) {
		btm.resetDescript();
	}
}

export async function handleReloadSurface(
	handler: import("../../sakura-command-handler.js").SakuraCommandHandler,
	_args: string[],
) {
	console.log("🔄 Execute reloadsurface triggered");
	const gc = handler.app.ghostController;
	if (gc?.currentGhost && gc?.currentShell) {
		const ghostPath = gc.currentGhost.path || "";
		await handler.app.surfaceManager?.loadSurfacesTxt?.(
			`${ghostPath}/shell/${gc.currentShell}`,
		);
	}
}

export async function handleLoadMakoto(
	handler: import("../../sakura-command-handler.js").SakuraCommandHandler,
	args: string[],
) {
	const moduleName = args[2] ?? args[1] ?? "";
	console.log(`🧩 Execute load,makoto triggered: ${moduleName}`);
	const gc = (
		handler as { app?: { ghostController?: Record<string, unknown> } }
	)?.app?.ghostController;
	if (typeof gc?.loadMakoto === "function") {
		await (gc.loadMakoto as (name: string) => Promise<unknown>)(moduleName);
	}
}

export async function handleUnloadMakoto(
	handler: import("../../sakura-command-handler.js").SakuraCommandHandler,
	args: string[],
) {
	const moduleName = args[2] ?? args[1] ?? "";
	console.log(`🧩 Execute unload,makoto triggered: ${moduleName}`);
	const gc = (
		handler as { app?: { ghostController?: Record<string, unknown> } }
	)?.app?.ghostController;
	if (typeof gc?.unloadMakoto === "function") {
		await (gc.unloadMakoto as (name: string) => Promise<unknown>)(moduleName);
	}
}

export async function handleReloadMakoto(
	handler: import("../../sakura-command-handler.js").SakuraCommandHandler,
	args: string[],
) {
	const moduleName = args[2] ?? args[1] ?? "";
	console.log(`🧩 Execute reload,makoto triggered: ${moduleName}`);
	const gc = (
		handler as { app?: { ghostController?: Record<string, unknown> } }
	)?.app?.ghostController;
	if (typeof gc?.reloadMakoto === "function") {
		await (gc.reloadMakoto as (name: string) => Promise<unknown>)(moduleName);
	}
}

export async function handleReloadAigraph(
	handler: import("../../sakura-command-handler.js").SakuraCommandHandler,
	_args: string[],
) {
	console.log("📊 Execute reload,aigraph triggered");
	const gc = (
		handler as { app?: { ghostController?: Record<string, unknown> } }
	)?.app?.ghostController;
	if (typeof gc?.reloadAigraph === "function") {
		await (gc.reloadAigraph as () => Promise<unknown>)();
	}
}
