/**
 * @file animation.ts
 * @brief さくらスクリプト再生時のサーフィス変更(\s)、SERIKOアニメーション再生・待機ハンドラ
 */

import type { SakuraAstNode } from "../../parser/ast-types.js";
import type { SakuraPlaybackController } from "../controller.js";

export function handleSurface(
	player: SakuraPlaybackController | unknown,
	app: import("../../../../main.js").NanaiAndroidMascotApp,
	token: SakuraAstNode | unknown,
	_context?: unknown,
) {
	app.ghostController.updateSurface(token.value, player.currentScope);
}

export async function handleAnimation(
	player: SakuraPlaybackController | unknown,
	app: import("../../../../main.js").NanaiAndroidMascotApp,
	token: SakuraAstNode | unknown,
	_context?: unknown,
) {
	app.surfaceManager?.playAnimationById(
		token.animId,
		player.currentScope,
		token.wait
	);
}

export async function handleWaitAnimation(
	player: SakuraPlaybackController | unknown,
	app: import("../../../../main.js").NanaiAndroidMascotApp,
	token: SakuraAstNode | unknown,
	_context?: unknown,
) {
	app.surfaceManager?.waitForAnimation(token.animId, player.currentScope);
}
