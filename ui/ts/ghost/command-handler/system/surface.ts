/**
 * @file surface.ts
 * @brief サーフェスプロパティ・拡大縮小・透明度・位置設定コマンドハンドラ
 */

import { invoke, isTauriAvailable } from "../../../core/tauri-helper.js";
import { scriptLifetimeState } from "../env.js";


export async function handleSetPropertyCommand(
	_handler: unknown,
	_args: string[],
) {


export async function _handleSetPropertyCommand(handler: any, args: string[]) {

	const key = args[2] ?? "";
	const val = args[3] ?? "";
	if (key) {
		scriptLifetimeState.setVariable(key, val);
		if (handler?.app?.ghostController?.sendShioriEvent) {
			handler.app.ghostController
				.sendShioriEvent("property.set", [key, val])
				.catch(() => {});
		}
	}
}

/**
 * SERIKO口パク有効化トグル (\![set,serikotalk,true/false])
 */

export async function _handleSetSerikoTalkCommand(
	_handler: unknown,
	_args: string[],
) {


export async function _handleSetSerikoTalkCommand(handler: any, args: string[]) {

	const valStr = String(args[2] ?? "true")
		.trim()
		.toLowerCase();
	const enabled = valStr !== "false" && valStr !== "0";
	const scope = handler.player?.currentScope ?? 0;
	if (handler.app?.surfaceAnimationManager?.setSerikoTalkEnabled) {
		handler.app.surfaceAnimationManager.setSerikoTalkEnabled(scope, enabled);
	}
}

/**
 * 他ゴーストサーフィス変更通知トグル (\![set,othersurfacechange,true/false])
 */
export async function _handleSetOtherSurfaceChangeCommand(

	_handler: unknown,


	handler: any,

	args: string[],
) {
	const valStr = String(args[2] ?? "false")
		.trim()
		.toLowerCase();
	const enabled = valStr === "true" || valStr === "1";
	if (handler.app?.ghostController) {
		handler.app.ghostController.otherSurfaceChangeEnabled = enabled;
	}
}


export async function _handleEnterMode(_handler: unknown, _args: string[]) {


export async function _handleEnterMode(handler: any, args: string[]) {

	const mode = (args[1] ?? "").toLowerCase();
	if (mode) {
		scriptLifetimeState.setMode(mode, true);
		if (handler.player) {
			handler.player[`is_${mode}`] = true;
		}
		const gc =
			handler.app?.ghostController ?? handler.player?.app?.ghostController;
		if (gc?.sendShioriEvent) {
			await gc.sendShioriEvent("OnModeChange", [
				mode,
				"enter",
				...args.slice(2),
			]);
		}
	}
}


export async function _handleLeaveMode(_handler: unknown, _args: string[]) {


export async function _handleLeaveMode(handler: any, args: string[]) {

	const mode = (args[1] ?? "").toLowerCase();
	if (mode) {
		scriptLifetimeState.setMode(mode, false);
		if (handler.player) {
			handler.player[`is_${mode}`] = false;
		}
		const gc =
			handler.app?.ghostController ?? handler.player?.app?.ghostController;
		if (gc?.sendShioriEvent) {
			await gc.sendShioriEvent("OnModeChange", [
				mode,
				"leave",
				...args.slice(2),
			]);
		}
	}
}


export async function _handleGetPropertyCommand(_handler: unknown, key: string) {
	if (!key) return "";
	if (handler?.app?.ghostController?.sendShioriEvent) {
		try {
			const _res: unknown = await handler.app.ghostController.sendShioriEvent(


export async function _handleGetPropertyCommand(handler: any, key: string) {
	if (!key) return "";
	if (handler?.app?.ghostController?.sendShioriEvent) {
		try {

			const res: any = await handler.app.ghostController.sendShioriEvent(

				"property.get",
				[key],
			);
			return res?.response?.value ?? "";
		} catch {
			return "";
		}
	}
	return scriptLifetimeState.getVariable(key) ?? "";
}


export async function _handleSetScalingCommand(
	_handler: unknown,
	_args: string[],
) {


export async function _handleSetScalingCommand(handler: any, args: string[]) {

	const scaleXStr = args[2] ?? "100";
	const scaleYStr = args[3] ?? scaleXStr;
	const scaleX = Number.parseFloat(scaleXStr);
	const scaleY = Number.parseFloat(scaleYStr);
	const scope = handler.player?.currentScope ?? 0;

	if (Number.isFinite(scaleX)) {
		handler.app.surfaceManager?.setScale?.(scaleX, scaleY, scope);
		if (isTauriAvailable()) {
			try {
				await invoke("set_character_scale", { scale: scaleX / 100.0 });
			} catch (err) {
				console.warn("set_character_scale failed:", err);
			}
		}
		if (handler.app.ghostController?.sendShioriEvent) {
			handler.app.ghostController
				.sendShioriEvent("OnShellScaling", [
					String(scaleX),
					String(scaleY),
					String(scope),
				])
				.catch(() => {});
			handler.app.ghostController
				.sendShioriEvent("OnBalloonScaling", [
					String(scaleX),
					String(scaleY),
					String(scope),
				])
				.catch(() => {});
		}
	}
}

export async function handleKeyPressEvent(

	handler: unknown,


	handler: any,

	key: string,
	modifiers: string = "",
)
	if (handler?.app?.ghostController?.sendShioriEvent && key) {
		await handler.app.ghostController.sendShioriEvent("OnKeyPress", [
			key,
			modifiers,
		]);
	}


export async function _handleSetAlphaCommand(_handler: unknown, _args: string[]) {


export async function _handleSetAlphaCommand(handler: any, args: string[]) {

	const alphaVal = Number.parseInt(args[2] ?? "100", 10);
	const scope = handler.player?.currentScope ?? 0;
	if (Number.isFinite(alphaVal)) {
		const clampedAlpha = Math.max(0, Math.min(100, alphaVal));
		handler.app.surfaceManager?.setAlpha?.(clampedAlpha, scope);
	}
}


export async function _handleSetPositionCommand(
	_handler: unknown,
	_args: string[],
) {


export async function _handleSetPositionCommand(handler: any, args: string[]) {

	const x = Number.parseInt(args[2] ?? "0", 10);
	const y = Number.parseInt(args[3] ?? "0", 10);
	const scopeStr = args[4];
	const scope =
		scopeStr !== undefined
			? Number.parseInt(scopeStr, 10)
			: (handler.player?.currentScope ?? 0);

	if (Number.isFinite(x) && Number.isFinite(y)) {
		handler.app.surfaceManager?.setPosition?.(x, y, scope);
		try {

			const _api = (globalThis as unknown).__TAURI__?.window;


			const api = (globalThis as any).__TAURI__?.window;

			if (api) {
				const win = api.getCurrentWindow();
				await win.setPosition(new api.PhysicalPosition(x, y));
			}
		} catch (e) {
			console.warn("set position window move failed:", e);
		}
	}
}
