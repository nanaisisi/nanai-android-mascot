/**
 * @file shiori.js
 * @brief SHIORI デバッグモード設定・再読み込みハンドラ
 */

/**
 * SHIORIデバッグモードを設定 (\![set,shioridebugmode,true/false])
 * [bang-set-shioridebugmode-true-false.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleSetShioriDebugMode(handler, args) {
	const mode = (args[2] ?? "").toLowerCase() === "true";
	if (handler.app.ghostController) {
		handler.app.ghostController.shioriDebugMode = mode;
	}
}

/**
 * SHIORI再読み込み (\![reload,shiori])
 * [bang-reload-shiori.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} _args
 */
export async function handleReloadShiori(handler, _args) {
	console.log("🔄 Execute reload,shiori triggered");
	if (handler.app.ghostController) {
		const ghost = handler.app.ghostController.currentGhost;
		if (ghost) {
			await handler.app.ghostController.initializeGhostSHIORI(ghost);
		}
	}
}

/**
 * シェル再読み込み (\![reload,shell])
 * [bang-reload-shell.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} [args]
 */
export async function handleReloadShell(handler, _args) {
	console.log("🔄 Execute reload,shell triggered");
	const gc = handler.app.ghostController;
	if (gc?.currentGhost && gc?.currentShell) {
		await gc.selectShell?.(gc.currentShell);
	}
}

/**
 * ゴースト再読み込み (\![reload,ghost])
 * [bang-reload-ghost.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} [args]
 */
export async function handleReloadGhost(handler, _args) {
	console.log("🔄 Execute reload,ghost triggered");
	const gc = handler.app.ghostController;
	const currentName = gc?.currentGhost?.name;
	if (gc && currentName) {
		await gc.switchGhost?.(currentName);
	}
}

/**
 * バルーン再読み込み (\![reload,balloon])
 * [bang-reload-balloon.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} [args]
 */
export async function handleReloadBalloon(handler, _args) {
	console.log("🔄 Execute reload,balloon triggered");
	const balloonTheme =
		handler.app.balloonTheme || handler.app.settings?.balloonTheme || "default";
	if (handler.app.setBalloonTheme) {
		await handler.app.setBalloonTheme(balloonTheme);
	}
}

/**
 * descript.txt 再読み込み (\![reload,descript])
 * [bang-reload-descript.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} [args]
 */
export async function handleReloadDescript(handler, _args) {
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

/**
 * サーフェス再読み込み (\![reloadsurface])
 * [bang-reloadsurface.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} [_args]
 */
export async function handleReloadSurface(handler, _args) {
	console.log("🔄 Execute reloadsurface triggered");
	const gc = handler.app.ghostController;
	if (gc?.currentGhost && gc?.currentShell) {
		const ghostPath = gc.currentGhost.path || "";
		await handler.app.surfaceManager?.loadSurfacesTxt?.(
			`${ghostPath}/shell/${gc.currentShell}`,
		);
	}
}
