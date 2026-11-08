/**
 * @file animation.ts
 * @brief さくらスクリプト再生時のサーフィス変更(\s)、SERIKOアニメーション再生・待機ハンドラ
 */

export function handleSurface(
<<<<<<< HEAD
	player: unknown,
	app: unknown,
	token: unknown,
	_context: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
) {
	app.ghostController.updateSurface(token.value, player.currentScope);
}

export async function handleAnimation(
<<<<<<< HEAD
	player: unknown,
	app: unknown,
	token: unknown,
	_context: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
) {
	await app.surfaceManager?.playAnimationById(
		token.animId,
		player.currentScope,
		token.wait,
	);
}

export async function handleWaitAnimation(
<<<<<<< HEAD
	player: unknown,
	app: unknown,
	token: unknown,
	_context: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
) {
	await app.surfaceManager?.waitForAnimation(token.animId, player.currentScope);
}
