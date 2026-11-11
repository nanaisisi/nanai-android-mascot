/**
 * @file scope.ts
 * @brief さくらスクリプト再生時のスコープ切替、バルーン表示・非表示、インライン画像出力ハンドラ
 */

import type { NanaiAndroidMascotApp } from "../../../../main.js";
import { invoke, isTauriAvailable } from "../../../core/tauri-helper.js";
import type { SakuraAstNode } from "../../parser/ast-types.js";
import type { SakuraScriptPlayer } from "../../sakura-script.js";
import type { SakuraPlaybackController } from "../controller.js";
import type { SakuraPlayContext } from "./choice.js";

type PlayTarget = SakuraScriptPlayer | SakuraPlaybackController;

export function handleScope(
	player: PlayTarget,
	app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	context: SakuraPlayContext,
) {
	const {
		sakuraText,
		keroText,
		sakuraDisplay,
		keroDisplay,
		hasTextContent,
		shownScopes,
	} = context;

	const rawScope = (token.value as number) ?? 0;
	player.currentScope = rawScope;
	const pc = (player.playbackController || player) as SakuraPlaybackController;
	pc.notifyScope?.(player.currentScope);

	if (player.currentScope === 0) {
		app.surfaceManager?.onTalkEnd(1);
		if (!isTauriAvailable()) {
			if (app.elements?.sakuraSlot) {
				app.elements.sakuraSlot.style.display = "flex";
			}
			if (sakuraDisplay) {
				sakuraDisplay.style.display = "block";
			}
		}
		context.currentBalloonText = sakuraText;
	} else if (player.currentScope === 1) {
		app.surfaceManager?.onTalkEnd(0);
		if (!isTauriAvailable()) {
			if (app.elements?.keroSlot) {
				app.elements.keroSlot.style.display = "flex";
			}
			if (keroDisplay && keroText) {
				keroDisplay.style.display = "block";
			}
		}
		context.currentBalloonText = keroText || sakuraText;
	} else {
		app.surfaceManager?.onTalkEnd(0);
		context.currentBalloonText = keroText || sakuraText;
	}

	if (
		isTauriAvailable() &&
		hasTextContent &&
		!shownScopes?.has(player.currentScope)
	) {
		shownScopes?.add(player.currentScope);
		invoke("show_balloon_window", {
			scopeId: player.currentScope,
			theme: app.currentBalloonTheme,
		}).catch(() => {});
	}
}

export function handleBalloon(
	player: PlayTarget,
	_app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	context: SakuraPlayContext,
) {
	const { sakuraDisplay, keroDisplay } = context;
	const balloonDisplay =
		player.currentScope === 1 ? keroDisplay : sakuraDisplay;
	if (token.value === -1) {
		if (balloonDisplay) balloonDisplay.style.display = "none";
	} else {
		if (balloonDisplay) balloonDisplay.style.display = "block";
	}
}

export function handleInlineBitmap(
	_player: PlayTarget,
	app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	context: SakuraPlayContext,
) {
	const { currentBalloonText, scheduleDesktopBalloonSync } = context;

	const img = document.createElement("img");
	img.className = "balloon-inline-bitmap";
	const themeName = app.currentBalloonTheme || "default";
	const rawPath = token.path || "";
	const fullPath =
		rawPath.startsWith("data:") ||
		rawPath.startsWith("http://") ||
		rawPath.startsWith("https://")
			? rawPath
			: `assets/balloon/${themeName}/${rawPath}`;

	const g = globalThis as unknown as {
		__TAURI__?: {
			core?: {
				convertFileSrc: (path: string) => string;
			};
		};
	};
	img.src = g.__TAURI__?.core?.convertFileSrc
		? g.__TAURI__.core.convertFileSrc(fullPath)
		: fullPath;
	img.style.display = "inline-block";
	img.style.verticalAlign = "middle";
	img.style.maxHeight = "1.2em";
	img.style.width = "auto";
	if (token.mode === "inline" || !token.mode) {
		currentBalloonText?.appendChild(img);
	} else {
		if (token.x !== undefined) img.style.left = `${token.x}px`;
		if (token.y !== undefined) img.style.top = `${token.y}px`;
		img.style.position = "absolute";
		currentBalloonText?.appendChild(img);
	}
	scheduleDesktopBalloonSync?.(false);
}
