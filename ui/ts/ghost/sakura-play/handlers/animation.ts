/**
 * @file animation.ts
 * @brief さくらスクリプト再生時のサーフィス変更(\s)、SERIKOアニメーション再生・待機ハンドラ
 */

export function handleSurface(
	player: import("../controller.js").SakuraPlayController,
	app: import("../../../main.js").NanaiAndroidMascotApp,
	token: import("../../parser/ast.js").ASTNode,
	_context: import("../sync-object.js").SakuraPlayContext,
) {
	app.ghostController.updateSurface(token.value, player.currentScope);
}

export async function handleAnimation(
	player: import("../controller.js").SakuraPlayController,
	app: import("../../../main.js").NanaiAndroidMascotApp,
	token: import("../../parser/ast.js").ASTNode,
	_context: import("../sync-object.js").SakuraPlayContext,
) {
	await app.surfaceManager?.playAnimationById(
		token.animId,
		player.currentScope,
		token.wait,
	);
}

export async function handleWaitAnimation(
	player: import("../controller.js").SakuraPlayController,
	app: import("../../../main.js").NanaiAndroidMascotApp,
	token: import("../../parser/ast.js").ASTNode,
	_context: import("../sync-object.js").SakuraPlayContext,
) {
	await app.surfaceManager?.waitForAnimation(token.animId, player.currentScope);
}
