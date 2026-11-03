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
	} else if (verb === "add") {
		// UKADOC/CROW: \![anim,add,...] 動的アニメーション・オーバーレイ追加
		await handleAnimAddCommand(handler, args.slice(2));
	}
}

/**
 * \![anim,add,...] サブコマンドの処理
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} subArgs
 */
async function handleAnimAddCommand(handler, subArgs) {
	if (!subArgs.length) return;
	const method = String(subArgs[0] ?? "").toLowerCase();
	const sm = handler.app.surfaceManager;
	const gc = handler.app.ghostController;
	const scope = handler.player.currentScope;

	if (method === "move") {
		// \![anim,add,move,x,y]
		const x = Number.parseInt(String(subArgs[1] ?? "0"), 10) || 0;
		const y = Number.parseInt(String(subArgs[2] ?? "0"), 10) || 0;
		sm?.setBaseMoveOffset?.(scope, x, y);
		if (gc?.setScopeMoveOffset) {
			gc.setScopeMoveOffset(scope, x, y);
		} else if (typeof document !== "undefined") {
			const isSubchar = scope >= 1;
			const selector = isSubchar ? "kero-display" : "ghost-display";
			const el = document.getElementById(selector);
			if (el) {
				el.style.transform = `translate(${x}px, ${y}px)`;
			}
		}
	} else if (method === "base") {
		// \![anim,add,base,ID]
		const targetSurface = subArgs[1];
		if (targetSurface != null && gc?.updateSurface) {
			await gc.updateSurface(targetSurface, scope);
		}
	} else if (method === "overlay" || method === "overlayfast") {
		// \![anim,add,overlay,ID(,x,y)] またはアニメーションパターン列
		const targetSurface = subArgs[1];
		const x = Number.parseInt(String(subArgs[2] ?? "0"), 10) || 0;
		const y = Number.parseInt(String(subArgs[3] ?? "0"), 10) || 0;
		const currentBase =
			sm?.currentSurfaceIdFor?.(scope) ?? (scope === 1 ? 10 : 0);

		if (targetSurface != null && gc?.updateSurface) {
			const resolvedFile = sm?.resolveSurfaceNumber
				? sm.resolveSurfaceNumber(targetSurface, scope)
				: targetSurface;
			await gc.updateSurface(currentBase, scope, [
				{
					file: `surface${resolvedFile}.png`,
					x,
					y,
					type: method,
				},
			]);
		}
	}
}
