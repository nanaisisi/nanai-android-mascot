/**
 * @file system.js
 * @brief SSP拡張システム制御コマンドハンドラ群 (Slot-06)
 * [bang-set-alignmentondesktop-bottom-top.md], [bang-set-tasktrayicon-.ico-duration-eq-runcount-eq.md],
 * [bang-set-trayballoon.md], [bang-biff.md], [bang-executesntp.md], [bang-open-explorer.md] 等
 */

import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";
import { scriptLifetimeState } from "./env.js";

/**
 * デスクトップ整列位置を設定 (\![set,alignmentondesktop,...])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleSetAlignmentOnDesktop(handler, args) {
	const mode = (args[2] ?? "").toLowerCase();
	handler.app.alignmentToDesktop = mode;
	if (mode === "free") return;

	try {
		const api = globalThis.__TAURI__?.window;
		if (!api) return;
		const win = api.getCurrentWindow();
		const monitor = await api.currentMonitor();
		if (!monitor) return;
		const size = await win.outerSize();
		const pos = await win.outerPosition();
		const { x: mx, y: my } = monitor.position;
		const { width: mw, height: mh } = monitor.size;
		let x = pos.x;
		let y = pos.y;
		if (mode === "bottom") y = my + mh - size.height;
		else if (mode === "top") y = my;
		else if (mode === "left") x = mx;
		else if (mode === "right") x = mx + mw - size.width;
		await win.setPosition(new api.PhysicalPosition(x, y));
	} catch (e) {
		console.warn("alignmentondesktop 失敗:", e);
	}
}

/**
 * タスクトレイアイコン設定 (\![set,tasktrayicon,...])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} _handler
 * @param {string[]} args
 */
export async function handleSetTaskTrayIcon(_handler, args) {
	const iconPath = args[2] ?? "";
	console.log(`📌 Task tray icon set: ${iconPath}`);
	if (isTauriAvailable()) {
		try {
			await invoke("set_tray_icon", { iconPath });
		} catch (err) {
			console.warn("set_tray_icon failed:", err);
		}
	}
}

/**
 * トレイバルーン表示通知 (\![set,trayballoon,...])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} _handler
 * @param {string[]} args
 */
export async function handleSetTrayBalloon(_handler, args) {
	const title = args[2] ?? "";
	const text = args[3] ?? "";
	console.log(`💬 Tray balloon notification: title=${title}, text=${text}`);
	if (isTauriAvailable()) {
		try {
			await invoke("show_tray_notification", { title, text });
		} catch (err) {
			console.warn("show_tray_notification failed:", err);
		}
	}
}

/**
 * メールチェック実行 (\![biff])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} _args
 */
export async function handleBiffCommand(handler, _args) {
	console.log("✉️ Biff mail check triggered");
	await handler.app.networkActions?.checkEmail?.();
}

/**
 * SNTP時刻合わせ実行 (\![executesntp])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} _args
 */
export async function handleExecuteSntpCommand(handler, _args) {
	console.log("⏱️ Execute SNTP time sync triggered");
	try {
		await handler.app.ghostController?.sendShioriEvent?.("OnSNTPCompare", [
			new Date().toISOString(),
		]);
	} catch (err) {
		console.warn("SNTP compare event trigger failed:", err);
	}
}

/**
 * 各種ダイアログ/エクスプローラーオープン (\![open,explorer,...], \![open,file,...] 等)
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleOpenSystemTarget(handler, args) {
	const target = (args[1] ?? "").toLowerCase();
	const pathOrParam = args[2] ?? "";

	switch (target) {
		case "explorer":
		case "shellexplorer":
		case "balloonexplorer":
		case "ghostexplorer":
			console.log(`📂 Open explorer requested: target=${target}`);
			handler.app.toggleMenu?.();
			break;

		case "file":
			console.log(`📄 Open file requested: path=${pathOrParam}`);
			if (isTauriAvailable() && pathOrParam) {
				try {
					await invoke("open_path", { path: pathOrParam });
				} catch (err) {
					console.warn("Failed to open file path:", err);
				}
			}
			break;

		case "browser":
			if (pathOrParam && /^https?:\/\//i.test(pathOrParam)) {
				if (typeof globalThis !== "undefined" && globalThis.open) {
					globalThis.open(pathOrParam, "_blank", "noopener,noreferrer");
				}
			}
			break;

		default:
			console.debug(`未対応の open システムターゲット: ${target}`);
			break;
	}
}

/**
 * プロパティ値をスクリプト寿命内に設定 (\![set,property,名前,値])
 * [bang-set-property.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} _handler
 * @param {string[]} args
 */
export async function handleSetPropertyCommand(_handler, args) {
	const key = args[2] ?? "";
	const val = args[3] ?? "";
	if (key) {
		scriptLifetimeState.setVariable(key, val);
	}
}

/**
 * サーフェス拡大縮小倍率を設定 (\![set,scaling,横倍率,縦倍率,オプション])
 * [bang-set-scaling.md], [bang-set-scaling-2.md], [bang-set-scaling-3.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
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
	}
}

/**
 * サーフェス透過度を設定 (\![set,alpha,透過度,オプション])
 * [bang-set-alpha.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
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
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
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

/**
 * SHIORIデバッグモードを設定 (\![set,shioridebugmode,true/false])
 * [bang-set-shioridebugmode-true-false.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleSetShioriDebugMode(handler, args) {
	const mode = (args[2] ?? "").toLowerCase() === "true";
	if (handler.app.ghostController) {
		handler.app.ghostController.shioriDebugMode = mode;
	}
}

/**
 * SHIORI再読み込み (\![reload,shiori])
 * [bang-reload-shiori.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} _args
 */
export async function handleReloadShiori(handler, _args) {
	console.log("🔄 Execute reload,shiori triggered");
	if (handler.app.ghostController) {
		const ghost = handler.app.ghostController.currentGhost;
		if (ghost) {
			await handler.app.ghostController.initializeGhostSHIORI(ghost);
		}
	}
}

/**
 * シェル位置初期化 (\![execute,resetwindowpos])
 * [bang-execute-resetwindowpos.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} _args
 */
export async function handleExecuteResetWindowPos(handler, _args) {
	console.log("📍 Execute resetwindowpos triggered");
	await handler.app.dispatchAction?.("reset-shell-position");
}

/**
 * バルーン位置初期化 (\![execute,resetballoonpos])
 * [bang-execute-resetballoonpos.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} _args
 */
export async function handleExecuteResetBalloonPos(handler, _args) {
	console.log("🎈 Execute resetballoonpos triggered");
	await handler.app.dispatchAction?.("reset-balloon-position");
}
