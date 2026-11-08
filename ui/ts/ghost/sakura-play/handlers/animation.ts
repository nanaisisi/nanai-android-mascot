/**
 * @file animation.ts
 * @brief さくらスクリプト再生時のサーフィス変更(\s)、SERIKOアニメーション再生・待機ハンドラ
 */

export function handleSurface(
	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	player: any,

	app: any,

	token: any,

	_context: any,
) {
	app.ghostController.updateSurface(token.value, player.currentScope);
}

export async function handleAnimation(
	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	player: any,

	app: any,

	token: any,

	_context: any,
) {
	await app.surfaceManager?.playAnimationById(
		token.animId,
		player.currentScope,
		token.wait,
	);
}

export async function handleWaitAnimation(
	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	player: any,

	app: any,

	token: any,

	_context: any,
) {
	await app.surfaceManager?.waitForAnimation(token.animId, player.currentScope);
}
