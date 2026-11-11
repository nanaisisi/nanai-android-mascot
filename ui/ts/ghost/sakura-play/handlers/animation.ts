// biome-ignore-all lint/suspicious/noExplicitAny: legacy handler parameters
/**
 * @file animation.ts
 * @brief さくらスクリプト再生時のサーフィス変更(\s)、SERIKOアニメーション再生・待機ハンドラ
 */

export function handleSurface(
	player: any,
	app: import("../../../../main.js").NanaiAndroidMascotApp,
	token: any,
	_context?: any,
) {
	app.ghostController.updateSurface(token.value, player.currentScope);
}

export async function handleAnimation(
	player: any,
	app: import("../../../../main.js").NanaiAndroidMascotApp,
	token: any,
	_context?: any,
) {
	await app.surfaceManager?.playAnimationById(
		token.animId,
		player.currentScope,
		token.wait,
	);
}

export async function handleWaitAnimation(
	player: any,
	app: import("../../../../main.js").NanaiAndroidMascotApp,
	token: any,
	_context?: any,
) {
	await app.surfaceManager?.waitForAnimation(
		token.animId,
		player.currentScope,
	);
}
