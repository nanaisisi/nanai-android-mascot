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
