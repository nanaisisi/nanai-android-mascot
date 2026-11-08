/**
 * @file surface.ts
 * @brief サーフェス操作・着せ替え・SERIKOアニメーション制御コマンド (\![bind,...], \![anim,...])
 */

export async function handleBindCommand(

	handler: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	handler: any,

	args: string[],
	raiseEvent: boolean = true,
) {
	const [category, part, statusVal] = args.slice(1);
	await handler.app.surfaceManager?.bindDressup?.(
		category,
		part,
		statusVal,
		handler.player.currentScope,
		raiseEvent,
	);
}


export async function handleAnimCommand(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleAnimCommand(handler: any, args: string[]) {

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
		await handleAnimAddCommand(handler, args.slice(2));
	}
}


async function handleAnimAddCommand(_handler: unknown, _subArgs: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
async function _handleAnimAddCommand(handler: any, subArgs: string[]) {

	if (!subArgs.length) return;
	const method = String(subArgs[0] ?? "").toLowerCase();
	const sm = handler.app.surfaceManager;
	const gc = handler.app.ghostController;
	const scope = handler.player.currentScope;

	if (method === "move") {
		const x = Number.parseInt(String(subArgs[1] ?? "0"), 10) || 0;
		const y = Number.parseInt(String(subArgs[2] ?? "0"), 10) || 0;
		sm?.setBaseMoveOffset?.(scope, x, y);
		if (gc?.setScopeMoveOffset) {
			gc.setScopeMoveOffset(scope, x, y);
		} else if (typeof document !== "undefined") {
			const selector =
				scope === 0
					? "ghost-display"
					: scope === 1
						? "kero-display"
						: `char-display-${scope}`;
			const el = document.getElementById(selector);
			if (el) {
				el.style.transform = `translate(${x}px, ${y}px)`;
			}
		}
	} else if (method === "base") {
		const targetSurface = subArgs[1];
		if (targetSurface != null && gc?.updateSurface) {
			await gc.updateSurface(targetSurface, scope);
		}
	} else if (method === "overlay" || method === "overlayfast") {
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
