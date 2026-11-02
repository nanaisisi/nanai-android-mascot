/**
 * @file surface.js
 * @brief サーフェス操作・着せ替え・SERIKOアニメーション制御コマンド (\![bind,...], \![anim,...])
 */

/**
 * 着せ替え設定コマンド (\![bind,category,part,status])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 * @param {boolean} [raiseEvent=true]
 */
export async function handleBindCommand(handler, args, raiseEvent = true) {
	const [category, part, statusVal] = args.slice(1);
	await handler.app.surfaceManager?.bindDressup?.(
		category,
		part,
		statusVal,
		handler.player.currentScope,
		raiseEvent,
	);
}

/**
 * アニメーション制御コマンド (\![anim,verb,id,...])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleAnimCommand(handler, args) {
	const [verbRaw, idVal, arg3, arg4] = args.slice(1);
	const targetStr = String(idVal ?? "").trim();
	const animIdNum = Number.parseInt(targetStr, 10);
	const animTarget = Number.isNaN(animIdNum) ? targetStr : animIdNum;
	const verb = String(verbRaw ?? "").toLowerCase();
	const sm = handler.app.surfaceManager;
	const scope = handler.player.currentScope;

	if (verb === "pause" || verb === "pouse") {
		sm?.pauseAnimationById?.(animTarget, scope);
	} else if (verb === "resume") {
		sm?.resumeAnimationById?.(animTarget, scope);
	} else if (verb === "stop" || verb === "clear") {
		sm?.stopAnimationById?.(animTarget, scope);
	} else if (verb === "offset") {
		const x = Number.parseInt(String(arg3 ?? "0"), 10) || 0;
		const y = Number.parseInt(String(arg4 ?? "0"), 10) || 0;
		sm?.setAnimationOffset?.(animTarget, x, y, scope);
	}
}
