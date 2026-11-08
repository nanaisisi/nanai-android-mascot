/**
 * @file animation.ts
 * @brief さくらスクリプト再生時のサーフィス変更(\s)、SERIKOアニメーション再生・待機ハンドラ
 */

export function handleSurface(
	player: unknown,
	app: unknown,
	token: unknown,
	_context: unknown,
) {
	app.ghostController.updateSurface(token.value, player.currentScope);
}

export async function handleAnimation(
	player: unknown,
	app: unknown,
	token: unknown,
	_context: unknown,
) {
	await app.surfaceManager?.playAnimationById(
		token.animId,
		player.currentScope,
		token.wait,
	);
}

export async function handleWaitAnimation(
	player: unknown,
	app: unknown,
	token: unknown,
	_context: unknown,
) {
	await app.surfaceManager?.waitForAnimation(token.animId, player.currentScope);
}
