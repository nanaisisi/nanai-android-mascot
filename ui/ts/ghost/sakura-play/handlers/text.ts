/**
 * @file text.ts
 * @brief さくらスクリプト再生時のテキスト出力、改行、文字消去、文字装飾、相対位置ハンドラ
 */

export async function handleChar(

	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	context: any,

) {
	const { sakuraText, keroText, scheduleDesktopBalloonSync } = context;
	const { currentBalloonText, currentAnchor, isQuickMode } = context;

	const span = document.createElement("span");
	span.textContent = token.value;
	if (player.currentFontStyles) {
		Object.assign(span.style, player.currentFontStyles);
	}
	if (currentAnchor) {
		currentAnchor.appendChild(span);
	} else {
		currentBalloonText.appendChild(span);
	}

	if (player.isSyncMode) {
		const mirrorTarget =
			currentBalloonText === sakuraText ? keroText : sakuraText;
		if (mirrorTarget) {
			const mirrorSpan = document.createElement("span");
			mirrorSpan.textContent = token.value;
			if (player.currentFontStyles) {
				Object.assign(mirrorSpan.style, player.currentFontStyles);
			}
			mirrorTarget.appendChild(mirrorSpan);
		}
		scheduleDesktopBalloonSync(false, 0);
		scheduleDesktopBalloonSync(false, 1);
		app.surfaceManager?.onCharSpoken(0);
		app.surfaceManager?.onCharSpoken(1);
	} else {
		scheduleDesktopBalloonSync(false);
		app.surfaceManager?.onCharSpoken(player.currentScope);
	}

	player.playbackController?.notifyChar?.(token.value, player.currentScope);

	if (!player.skipRequested && !isQuickMode) {
		const isPunctuation = /[、。！？,!?]/.test(token.value);
		const baseWait = isPunctuation ? 140 : 40;
		const waitMs = player.playbackController?.calculateWait
			? player.playbackController.calculateWait(baseWait, true)
			: baseWait;
		if (waitMs > 0) {
			await (player.sleep
				? player.sleep(waitMs)
				: new Promise((r) => setTimeout(r, waitMs)));
		}
	}
}

export function handleNewline(

	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	context: any,

) {
	const { sakuraText, keroText, scheduleDesktopBalloonSync } = context;
	const { currentBalloonText } = context;

	if (token.half) {
		const halfBr = document.createElement("span");
		halfBr.style.display = "block";
		halfBr.style.height = "0.4em";
		currentBalloonText.appendChild(halfBr);
	} else {
		currentBalloonText.appendChild(document.createElement("br"));
	}

	if (player.isSyncMode) {
		const mirrorTarget =
			currentBalloonText === sakuraText ? keroText : sakuraText;
		if (mirrorTarget) {
			if (token.half) {
				const mirrorHalfBr = document.createElement("span");
				mirrorHalfBr.style.display = "block";
				mirrorHalfBr.style.height = "0.4em";
				mirrorTarget.appendChild(mirrorHalfBr);
			} else {
				mirrorTarget.appendChild(document.createElement("br"));
			}
		}
		scheduleDesktopBalloonSync(false, 0);
		scheduleDesktopBalloonSync(false, 1);
	} else {
		scheduleDesktopBalloonSync(false);
	}
}


export function handleClear(
	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,
) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _handleClear(player: any, app: any, token: any, context: any) {

	const { scheduleDesktopBalloonSync } = context;
	const { currentBalloonText } = context;

	player.playbackController?.notifyClear?.(
		token.mode || "all",
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
		while (removed < count && currentBalloonText.lastChild) {
			const lastNode = currentBalloonText.lastChild;
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
		while (removedLines < count && currentBalloonText.lastChild) {

			const _lastNode: unknown = currentBalloonText.lastChild;

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const lastNode: any = currentBalloonText.lastChild;

			const isBr =
				lastNode.nodeName === "BR" ||
				(lastNode.nodeName === "SPAN" && lastNode.style?.display === "block");
			currentBalloonText.removeChild(lastNode);
			if (isBr) {
				removedLines++;
			}
		}
	} else {
		currentBalloonText.innerHTML = "";
	}
	scheduleDesktopBalloonSync(true);
}

export function _handleOffset(

	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	context: any,

) {
	const { scheduleDesktopBalloonSync, currentBalloonText } = context;

	const spacer = document.createElement("span");
	spacer.style.display = "inline-block";
	if (token.x.startsWith("@")) {
		spacer.style.marginLeft = `${token.x.slice(1)}px`;
	} else {
		spacer.style.position = "relative";
		spacer.style.left = `${token.x}px`;
	}
	if (token.y.startsWith("@")) {
		spacer.style.marginTop = `${token.y.slice(1)}px`;
	} else {
		spacer.style.top = `${token.y}px`;
	}
	currentBalloonText.appendChild(spacer);
	scheduleDesktopBalloonSync(false);
}


export function _handleFont(
	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,
) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _handleFont(player: any, _app: any, token: any, _context: any) {

	player.currentFontStyles = player.currentFontStyles || ;
	if (token.tag === "default") {
		player.currentFontStyles = {};
	} else if (token.tag === "color") {
		if (token.param) player.currentFontStyles.color = token.param;
		else delete player.currentFontStyles.color;
	} else if (token.tag === "bold") {
		player.currentFontStyles.fontWeight =
			token.param === "0" || token.param === "false" ? "normal" : "bold";
	} else if (token.tag === "italic") {
		player.currentFontStyles.fontStyle =
			token.param === "0" || token.param === "false" ? "normal" : "italic";
	} else if (token.tag === "strike") {
		player.currentFontStyles.textDecoration =
			token.param === "0" || token.param === "false" ? "none" : "line-through";
	} else if (token.tag === "underline") {
		player.currentFontStyles.textDecoration =
			token.param === "0" || token.param === "false" ? "none" : "underline";
	} else if (token.tag === "height") {
		if (token.param) {
			const size =
				token.param.endsWith("px") ||
				token.param.endsWith("pt") ||
				token.param.endsWith("em")
					? token.param
					: `${token.param}px`;
			player.currentFontStyles.fontSize = size;
		}
	} else if (token.tag === "shadow") {
		if (token.param === "0" || token.param === "none") {
			delete player.currentFontStyles.textShadow;
		} else {
			const col = token.param || "rgba(0,0,0,0.5)";
			player.currentFontStyles.textShadow = `1px 1px 2px ${col}`;
		}
	} else if (token.tag === "name" && token.param) {
		player.currentFontStyles.fontFamily = token.param;
	}
}
