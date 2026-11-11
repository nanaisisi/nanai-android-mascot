// biome-ignore-all lint/suspicious/noExplicitAny: legacy handler parameters
/**
 * @file surface.ts
 * @brief サーフェスプロパティ・拡大縮小・透明度・位置設定コマンドハンドラ
 */

import { invoke, isTauriAvailable } from "../../../core/tauri-helper.js";
import { scriptLifetimeState } from "../env.js";

export async function handleSetPropertyCommand(
	handler: unknown,
	args: string[],
) {
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
export async function handleSetSerikoTalkCommand(
	handler: unknown,
	args: string[],
) {
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
export async function handleSetOtherSurfaceChangeCommand(
	handler: unknown,
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

export async function handleEnterMode(handler: unknown, args: string[]) {
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

export async function handleLeaveMode(handler: unknown, args: string[]) {
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

/**
 * プロパティ値取得および \![get,property,イベント名,プロパティ名1,プロパティ名2,...] コマンド
 * [bang-get-property.md], [property.get.md]
 */
export async function handleGetPropertyCommand(
	handler: unknown,
	keyOrArgs: string | string[],
) {
	const h = handler;

	// 1. 配列指定時の \![get,property,eventName,...propKeys] 形式
	if (Array.isArray(keyOrArgs)) {
		const rawArgs =
			keyOrArgs[0]?.toLowerCase() === "get" ? keyOrArgs.slice(1) : keyOrArgs;
		const eventName = rawArgs[1] ?? "";
		const propKeys = rawArgs.slice(2);
		if (!eventName || propKeys.length === 0) {
			return;
		}

		const values: string[] = [];
		for (const prop of propKeys) {
			const trimmedProp = prop.trim();
			let val = "";
			if (h?.app?.ghostController?.evaluateProperty) {
				try {
					val = String(
						(await h.app.ghostController.evaluateProperty(trimmedProp)) ?? "",
					);
				} catch {
					val = "";
				}
			} else if (h?.app?.ghostController?.sendShioriEvent) {
				try {
					const res: unknown = await h.app.ghostController.sendShioriEvent(
						"property.get",
						[trimmedProp],
					);
					val =
						(res as { response?: { value?: string } })?.response?.value ?? "";
				} catch {
					val = "";
				}
			}
			if (!val) {
				val = scriptLifetimeState.getVariable(trimmedProp) ?? "";
			}
			values.push(val);
		}

		if (h?.app?.ghostController?.sendShioriEvent) {
			await h.app.ghostController.sendShioriEvent(eventName, values);
		}
		return;
	}

	// 2. 単一プロパティ名取得時のフォールバック
	const key = keyOrArgs;
	if (!key) return "";
	if (h?.app?.ghostController?.evaluateProperty) {
		try {
			const res = await h.app.ghostController.evaluateProperty(key);
			if (res !== undefined && res !== null) return String(res);
		} catch {
			// fall through
		}
	}
	if (h?.app?.ghostController?.sendShioriEvent) {
		try {
			const res: unknown = await h.app.ghostController.sendShioriEvent(
				"property.get",
				[key],
			);
			return (res as { response?: { value?: string } })?.response?.value ?? "";
		} catch {
			return "";
		}
	}
	return (
		scriptLifetimeState.getVariable(
			typeof key === "string" ? key : String(key),
		) ?? ""
	);
}

export async function handleSetScalingCommand(
	handler: unknown,
	args: string[],
) {
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
	key: string,
	modifiers: string = "",
) {
	if (handler?.app?.ghostController?.sendShioriEvent && key) {
		await handler.app.ghostController.sendShioriEvent("OnKeyPress", [
			key,
			modifiers,
		]);
	}
}

export async function handleSetAlphaCommand(handler: unknown, args: string[]) {
	const alphaVal = Number.parseInt(args[2] ?? "100", 10);
	const scope = handler.player?.currentScope ?? 0;
	if (Number.isFinite(alphaVal)) {
		const clampedAlpha = Math.max(0, Math.min(100, alphaVal));
		handler.app.surfaceManager?.setAlpha?.(clampedAlpha, scope);
	}
}

export async function handleSetPositionCommand(
	handler: unknown,
	args: string[],
) {
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
			const api = (globalThis as unknown).__TAURI__?.window;
			if (api) {
				const win = api.getCurrentWindow();
				await win.setPosition(new api.PhysicalPosition(x, y));
			}
		} catch (e) {
			console.warn("set position window move failed:", e);
		}
	}
}
