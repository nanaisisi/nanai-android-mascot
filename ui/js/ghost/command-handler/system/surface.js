/**
 * @file surface.js
 * @brief サーフェスプロパティ・拡大縮小・透明度・位置設定コマンドハンドラ
 */

import { invoke, isTauriAvailable } from "../../../core/tauri-helper.js";
import { scriptLifetimeState } from "../env.js";

/**
 * プロパティ値をスクリプト寿命内に設定 (\![set,property,名前,値])
 * [bang-set-property.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} _handler
 * @param {string[]} args
 */
export async function handleSetPropertyCommand(handler, args) {
	const key = args[2] ?? "";
	const val = args[3] ?? "";
	if (key) {
		scriptLifetimeState.setVariable(key, val);
		// UKADOC property.set / property.get SHIORI連携
		if (handler?.app?.ghostController?.sendShioriEvent) {
			handler.app.ghostController
				.sendShioriEvent("property.set", [key, val])
				.catch(() => {});
		}
	}
}

/**
 * プロパティ値をSHIORIへ要求/取得
 * [property.get.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string} key
 */
export async function handleGetPropertyCommand(handler, key) {
	if (!key) return "";
	if (handler?.app?.ghostController?.sendShioriEvent) {
		try {
			const res = await handler.app.ghostController.sendShioriEvent(
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

/**
 * サーフェス拡大縮小倍率を設定 (\![set,scaling,横倍率,縦倍率,オプション])
 * [bang-set-scaling.md], [bang-set-scaling-2.md], [bang-set-scaling-3.md], [OnShellScaling.md], [OnBalloonScaling.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleSetScalingCommand(handler, args) {
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
		// UKADOCスケーリングイベント連携: OnShellScaling, OnBalloonScaling
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

/**
 * キー押下イベントハンドラ (\![raise,OnKeyPress,...])
 * [OnKeyPress.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string} key
 * @param {string} [modifiers=""]
 */
export async function handleKeyPressEvent(handler, key, modifiers = "") {
	if (handler?.app?.ghostController?.sendShioriEvent && key) {
		await handler.app.ghostController.sendShioriEvent("OnKeyPress", [
			key,
			modifiers,
		]);
	}
}

/**
 * サーフェス透過度を設定 (\![set,alpha,透過度,オプション])
 * [bang-set-alpha.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleSetAlphaCommand(handler, args) {
	const alphaVal = Number.parseInt(args[2] ?? "100", 10);
	const scope = handler.player?.currentScope ?? 0;
	if (Number.isFinite(alphaVal)) {
		const clampedAlpha = Math.max(0, Math.min(100, alphaVal));
		handler.app.surfaceManager?.setAlpha?.(clampedAlpha, scope);
	}
}

/**
 * サーフェス固定位置を設定 (\![set,position,x,y,スコープID])
 * [bang-set-position-x-y-ID.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleSetPositionCommand(handler, args) {
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
			const api = globalThis.__TAURI__?.window;
			if (api) {
				const win = api.getCurrentWindow();
				await win.setPosition(new api.PhysicalPosition(x, y));
			}
		} catch (e) {
			console.warn("set position window move failed:", e);
		}
	}
}
