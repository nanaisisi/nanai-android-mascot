/**
 * @file animation.ts
 * @brief さくらスクリプト再生時のサーフィス変更(\s)、SERIKOアニメーション再生・待機ハンドラ
 */

import type { NanaiAndroidMascotApp } from "../../../../main.js";
import type { SakuraAstNode } from "../../parser/ast-types.js";
import type { SakuraScriptPlayer } from "../../sakura-script.js";
import type { SakuraPlaybackController } from "../controller.js";

type PlayTarget = SakuraScriptPlayer | SakuraPlaybackController;

export function handleSurface(
	player: PlayTarget,
	app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	_context?: unknown,
) {
	if (token.value !== undefined && token.value !== null) {
		app.ghostController.updateSurface(
			token.value as number | string,
			player.currentScope,
		);
	}
}

export async function handleAnimation(
	player: PlayTarget,
	app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	_context?: unknown,
) {
	if (token.animId !== undefined) {
		await app.surfaceManager?.playAnimationById(
			token.animId,
			player.currentScope,
			Boolean(token.wait),
		);
	}
}

export async function handleWaitAnimation(
	player: PlayTarget,
	app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	_context?: unknown,
) {
	if (token.animId !== undefined) {
		await app.surfaceManager?.waitForAnimation(
			token.animId,
			player.currentScope,
		);
	}
}
