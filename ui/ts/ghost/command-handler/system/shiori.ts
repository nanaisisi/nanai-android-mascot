/**
 * @file shiori.ts
 * @brief SHIORI デバッグモード設定・再読み込みハンドラ
 */


export async function handleSetShioriDebugMode(
	_handler: unknown,
	_args: string[],
) {


export async function _handleSetShioriDebugMode(handler: any, args: string[]) {

	const mode = (args[2] ?? "").toLowerCase() === "true";
	if (handler.app.ghostController) {
		handler.app.ghostController.shioriDebugMode = mode;
	}
}


export async function _handleReloadShiori(_handler: unknown, _args: string[]) {


export async function _handleReloadShiori(handler: any, _args: string[]) {

	console.log("🔄 Execute reload,shiori triggered");
	if (handler.app.ghostController) {
		const ghost = handler.app.ghostController.currentGhost;
		if (ghost) {
			await handler.app.ghostController.initializeGhostSHIORI(ghost);
		}
	}
}


export async function _handleReloadShell(_handler: unknown, _args: string[]) {


export async function _handleReloadShell(handler: any, _args: string[]) {

	console.log("🔄 Execute reload,shell triggered");
	const gc = handler.app.ghostController;
	if (gc?.currentGhost && gc?.currentShell) {
		await gc.selectShell?.(gc.currentShell);
	}
}


export async function _handleReloadGhost(_handler: unknown, _args: string[]) {


export async function _handleReloadGhost(handler: any, _args: string[]) {

	console.log("🔄 Execute reload,ghost triggered");
	const gc = handler.app.ghostController;
	const currentName = gc?.currentGhost?.name;
	if (gc && currentName) {
		await gc.switchGhost?.(currentName);
	}
}


export async function _handleReloadBalloon(_handler: unknown, _args: string[]) {


export async function _handleReloadBalloon(handler: any, _args: string[]) {

	console.log("🔄 Execute reload,balloon triggered");
	const balloonTheme =
		handler.app.balloonTheme || handler.app.settings?.balloonTheme || "default";
	if (handler.app.setBalloonTheme) {
		await handler.app.setBalloonTheme(balloonTheme);
	}
}


export async function _handleReloadDescript(_handler: unknown, _args: string[]) {


export async function _handleReloadDescript(handler: any, _args: string[]) {

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


export async function _handleReloadSurface(_handler: unknown, _args: string[]) {


export async function _handleReloadSurface(handler: any, _args: string[]) {

	console.log("🔄 Execute reloadsurface triggered");
	const gc = handler.app.ghostController;
	if (gc?.currentGhost && gc?.currentShell) {
		const ghostPath = gc.currentGhost.path || "";
		await handler.app.surfaceManager?.loadSurfacesTxt?.(
			`${ghostPath}/shell/${gc.currentShell}`,
		);
	}
}
