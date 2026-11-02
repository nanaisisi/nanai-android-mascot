/**
 * @file animation.js
 * @brief さくらスクリプト再生時のサーフィス変更(\s)、SERIKOアニメーション再生・待機ハンドラ
 */

export function handleSurface(player, app, token, _context) {
	app.ghostController.updateSurface(token.value, player.currentScope);
}

export async function handleAnimation(player, app, token, _context) {
	await app.surfaceManager?.playAnimationById(
		token.animId,
		player.currentScope,
		token.wait,
	);
}

export async function handleWaitAnimation(player, app, token, _context) {
	await app.surfaceManager?.waitForAnimation(token.animId, player.currentScope);
}
