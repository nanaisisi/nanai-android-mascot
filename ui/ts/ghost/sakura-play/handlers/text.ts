/**
 * @file text.ts
 * @brief さくらスクリプト再生時のテキスト出力、改行、文字消去、文字装飾、相対位置ハンドラ
 */

import type { NanaiAndroidMascotApp } from "../../../../main.js";
import type { SakuraAstNode } from "../../parser/ast-types.js";
import type { SakuraScriptPlayer } from "../../sakura-script.js";
import type { SakuraPlaybackController } from "../controller.js";
import type { SakuraPlayContext } from "./choice.js";

type PlayTarget = SakuraScriptPlayer | SakuraPlaybackController;

export async function handleChar(
	player: PlayTarget,
	app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	context: SakuraPlayContext,
) {
	const { sakuraText, keroText, scheduleDesktopBalloonSync } = context;
	const { currentBalloonText, currentAnchor, isQuickMode } = context;

	const span = document.createElement("span");
	span.textContent = (token.value as string) || "";
	if (player.currentFontStyles) {
		Object.assign(span.style, player.currentFontStyles);
	}
	if (currentAnchor) {
		currentAnchor.appendChild(span);
	} else {
		currentBalloonText?.appendChild(span);
	}

	if (player.isSyncMode) {
		const targetScopes: number[] =
			Array.isArray(player.syncScopes) && player.syncScopes.length > 0
				? player.syncScopes
				: [0, 1];

		for (const sc of targetScopes) {
			const targetEl = sc === 1 ? keroText : sc === 0 ? sakuraText : null;
			if (targetEl && targetEl !== currentBalloonText) {
				const mirrorSpan = document.createElement("span");
				mirrorSpan.textContent = (token.value as string) || "";
				if (player.currentFontStyles) {
					Object.assign(mirrorSpan.style, player.currentFontStyles);
				}
				targetEl.appendChild(mirrorSpan);
			}
			scheduleDesktopBalloonSync?.(false, sc);
			app.surfaceManager?.onCharSpoken(sc);
		}
	} else {
		scheduleDesktopBalloonSync?.(false);
		app.surfaceManager?.onCharSpoken(player.currentScope);
	}

	const pc = (player.playbackController || player) as SakuraPlaybackController;
	pc.notifyChar?.((token.value as string) || "", player.currentScope);

	if (!player.skipRequested && !isQuickMode) {
		const isPunctuation = /[、。！？,!?]/.test((token.value as string) || "");
		const baseWait = isPunctuation ? 140 : 40;
		const waitMs = pc.calculateWait
			? pc.calculateWait(baseWait, true)
			: baseWait;
		if (waitMs > 0) {
			await (player.sleep
				? player.sleep(waitMs)
				: new Promise((r) => setTimeout(r, waitMs)));
		}
	}
}

export function handleNewline(
	player: PlayTarget,
	_app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	context: SakuraPlayContext,
) {
	const { sakuraText, keroText, scheduleDesktopBalloonSync } = context;
	const { currentBalloonText } = context;

	if (token.half) {
		const halfBr = document.createElement("span");
		halfBr.style.display = "block";
		halfBr.style.height = "0.4em";
		currentBalloonText?.appendChild(halfBr);
	} else {
		currentBalloonText?.appendChild(document.createElement("br"));
	}

	if (player.isSyncMode) {
		const targetScopes: number[] =
			Array.isArray(player.syncScopes) && player.syncScopes.length > 0
				? player.syncScopes
				: [0, 1];

		for (const sc of targetScopes) {
			const targetEl = sc === 1 ? keroText : sc === 0 ? sakuraText : null;
			if (targetEl && targetEl !== currentBalloonText) {
				if (token.half) {
					const mirrorHalfBr = document.createElement("span");
					mirrorHalfBr.style.display = "block";
					mirrorHalfBr.style.height = "0.4em";
					targetEl.appendChild(mirrorHalfBr);
				} else {
					targetEl.appendChild(document.createElement("br"));
				}
			}
			scheduleDesktopBalloonSync?.(false, sc);
		}
	} else {
		scheduleDesktopBalloonSync?.(false);
	}
}

export function handleClear(
	player: PlayTarget,
	app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	context: SakuraPlayContext,
) {
	const { scheduleDesktopBalloonSync } = context;
	const { currentBalloonText } = context;

	const pc = (player.playbackController || player) as SakuraPlaybackController;
	pc.notifyClear?.(
		(token.mode as "all" | "char" | "line") || "all",
		token.count || 1,
	);
	if (
		(!token.mode || token.mode === "all") &&
		app.ghostController?.sendBalloonCloseNotify
	) {
		app.ghostController.sendBalloonCloseNotify(player.lastScript || "");
	}
	if (token.mode === "char") {
		const count = Math.max(1, token.count || 1);
		let removed = 0;
		while (removed < count && currentBalloonText?.lastChild) {
			const lastNode = currentBalloonText.lastChild as CharacterData | ChildNode;
			if (lastNode.nodeType === Node.TEXT_NODE) {
				const text = lastNode.nodeValue || "";
				if (text.length <= count - removed) {
					removed += text.length;
					currentBalloonText.removeChild(lastNode);
				} else {
					lastNode.nodeValue = text.slice(0, -(count - removed));
					removed = count;
				}
			} else {
				currentBalloonText.removeChild(lastNode);
				removed++;
			}
		}
	} else if (token.mode === "line") {
		const count = Math.max(1, token.count || 1);
		let removedLines = 0;
		while (removedLines < count && currentBalloonText?.lastChild) {
			const lastNode = currentBalloonText.lastChild as HTMLElement;
			const isBr =
				lastNode.nodeName === "BR" ||
				(lastNode.nodeName === "SPAN" && lastNode.style?.display === "block");
			currentBalloonText.removeChild(lastNode);
			if (isBr) {
				removedLines++;
			}
		}
	} else if (currentBalloonText) {
		currentBalloonText.innerHTML = "";
	}
	scheduleDesktopBalloonSync?.(true);
}

export function handleOffset(
	_player: PlayTarget,
	_app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	context: SakuraPlayContext,
) {
	const { scheduleDesktopBalloonSync, currentBalloonText } = context;

	const spacer = document.createElement("span");
	spacer.style.display = "inline-block";
	const xStr = String(token.x ?? "");
	const yStr = String(token.y ?? "");

	if (xStr.startsWith("@")) {
		spacer.style.marginLeft = `${xStr.slice(1)}px`;
	} else if (token.x !== undefined) {
		spacer.style.position = "relative";
		spacer.style.left = `${token.x}px`;
	}

	if (yStr.startsWith("@")) {
		spacer.style.marginTop = `${yStr.slice(1)}px`;
	} else if (token.y !== undefined) {
		spacer.style.top = `${token.y}px`;
	}

	currentBalloonText?.appendChild(spacer);
	scheduleDesktopBalloonSync?.(false);
}

export function handleFont(
	player: PlayTarget,
	_app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	_context: SakuraPlayContext,
) {
	if (!player.currentFontStyles) {
		player.currentFontStyles = {};
	}
	const styles = player.currentFontStyles;
	const tag = token.tag as string;
	const param = token.param as string;

	if (tag === "default") {
		player.currentFontStyles = {};
	} else if (tag === "color") {
		if (param) styles.color = param;
		else delete styles.color;
	} else if (tag === "bold") {
		styles.fontWeight =
			param === "0" || param === "false" ? "normal" : "bold";
	} else if (tag === "italic") {
		styles.fontStyle =
			param === "0" || param === "false" ? "normal" : "italic";
	} else if (tag === "strike") {
		styles.textDecoration =
			param === "0" || param === "false" ? "none" : "line-through";
	} else if (tag === "underline") {
		styles.textDecoration =
			param === "0" || param === "false" ? "none" : "underline";
	} else if (tag === "height") {
		if (param) {
			const size =
				param.endsWith("px") ||
				param.endsWith("pt") ||
				param.endsWith("em")
					? param
					: `${param}px`;
			styles.fontSize = size;
		}
	} else if (tag === "shadow") {
		if (param === "0" || param === "none") {
			delete styles.textShadow;
		} else {
			const col = param || "rgba(0,0,0,0.5)";
			styles.textShadow = `1px 1px 2px ${col}`;
		}
	} else if (tag === "name" && param) {
		styles.fontFamily = param;
	}
}
