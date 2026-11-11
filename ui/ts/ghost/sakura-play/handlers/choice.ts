// biome-ignore-all lint/suspicious/noExplicitAny: legacy handler parameters
/**
 * @file choice.ts
 * @brief さくらスクリプト再生時の選択肢(\q)およびアンカー(\_a)要素生成・イベントハンドラ
 */

export function handleChoice(player: any, app: any, token: any, context: any) {
	const { currentBalloonText, flushDesktopBalloon } = context;

	const choiceBtn = document.createElement("button");
	choiceBtn.className = "balloon-choice-btn";
	choiceBtn.setAttribute("data-choice-id", token.id);
	choiceBtn.textContent = token.text;
	let hoverTimer: any = null;
	choiceBtn.addEventListener("click", (e: MouseEvent) => {
		e.stopPropagation();
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
		if (player.choiceTimeoutTimer) {
			clearTimeout(player.choiceTimeoutTimer);
			player.choiceTimeoutTimer = null;
		}
		if (player.onChoiceSelected) {
			player.onChoiceSelected(token.id, token.text, token.args || []);
		} else {
			app.ghostController?.sendShioriEvent?.("OnChoiceSelectEx", [
				token.text,
				token.id,
				...(token.args || []),
			]);
			app.ghostController?.sendShioriEvent?.("OnChoiceSelect", [
				token.id,
				token.text,
				...(token.args || []),
			]);
		}
	});
	choiceBtn.addEventListener("mouseenter", () => {
		app.ghostController?.sendShioriEvent("OnChoiceEnter", [
			token.text,
			token.id,
			...(token.args || []),
		]);
		if (hoverTimer) clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => {
			app.ghostController?.sendShioriEvent("OnChoiceHover", [
				token.text,
				token.id,
				...(token.args || []),
			]);
			hoverTimer = null;
		}, 500);
	});
	choiceBtn.addEventListener("mouseleave", () => {
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
		app.ghostController?.sendShioriEvent("OnChoiceEnter", []);
	});
	currentBalloonText.appendChild(document.createElement("br"));
	currentBalloonText.appendChild(choiceBtn);
	flushDesktopBalloon();

	if (player.choiceTimeout > 0 && !player.choiceTimeoutTimer) {
		player.choiceTimeoutTimer = setTimeout(() => {
			player.onChoiceTimeout();
		}, player.choiceTimeout);
	}
}

export function handleAnchorBegin(
	_player: any,
	app: any,
	token: any,
	context: any,
) {
	const { currentBalloonText, scheduleDesktopBalloonSync } = context;

	const anchorSpan = document.createElement("span");
	anchorSpan.className = "balloon-anchor";
	anchorSpan.dataset.anchorId = token.id;
	anchorSpan.setAttribute("data-anchor-id", token.id);
	let hoverTimer: any = null;
	anchorSpan.addEventListener("click", async (e: MouseEvent) => {
		e.stopPropagation();
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
		const anchorText = anchorSpan.textContent || token.id;
		const args = token.args || [];
		if (app.ghostController?.sendShioriEvent) {
			// UKADOC: OnAnchorSelectEx is sent first (Reference0: text, Reference1: ID, Reference2..N: args)
			const resEx: any = await app.ghostController.sendShioriEvent(
				"OnAnchorSelectEx",
				[anchorText, token.id, ...args],
			);
			if (resEx && (resEx.response || resEx.script)) {
				return;
			}
			await app.ghostController.sendShioriEvent("OnAnchorSelect", [
				token.id,
				...args,
			]);
		}
	});
	anchorSpan.addEventListener("mouseenter", () => {
		app.ghostController?.sendShioriEvent("OnAnchorEnter", [
			anchorSpan.textContent || token.id,
			token.id,
			...(token.args || []),
		]);
		if (hoverTimer) clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => {
			app.ghostController?.sendShioriEvent("OnAnchorHover", [
				anchorSpan.textContent || token.id,
				token.id,
				...(token.args || []),
			]);
			hoverTimer = null;
		}, 500);
	});
	anchorSpan.addEventListener("mouseleave", () => {
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
		app.ghostController?.sendShioriEvent("OnAnchorEnter", []);
	});
	currentBalloonText.appendChild(anchorSpan);
	context.currentAnchor = anchorSpan;
	scheduleDesktopBalloonSync(false);
}

export function handleAnchorEnd(
	_player: any,
	_app: any,
	_token: any,
	context: any,
) {
	context.currentAnchor = null;
}

export function handleChoiceScopeBegin(
	player: any,
	app: any,
	token: any,
	context: any,
) {
	const {
		currentBalloonText,
		flushDesktopBalloon,
		scheduleDesktopBalloonSync,
	} = context;

	const inlineChoiceSpan = document.createElement("span");
	inlineChoiceSpan.className = "balloon-choice-inline balloon-choice-btn";
	inlineChoiceSpan.setAttribute("data-choice-id", token.id);
	inlineChoiceSpan.style.cursor = "pointer";

	let hoverTimer: any = null;
	inlineChoiceSpan.addEventListener("click", (e: MouseEvent) => {
		e.stopPropagation();
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
		if (player.choiceTimeoutTimer) {
			clearTimeout(player.choiceTimeoutTimer);
			player.choiceTimeoutTimer = null;
		}
		const choiceText = inlineChoiceSpan.textContent || token.id;
		if (player.onChoiceSelected) {
			player.onChoiceSelected(token.id, choiceText, token.args || []);
		} else {
			app.ghostController?.sendShioriEvent?.("OnChoiceSelectEx", [
				choiceText,
				token.id,
				...(token.args || []),
			]);
			app.ghostController?.sendShioriEvent?.("OnChoiceSelect", [
				token.id,
				choiceText,
				...(token.args || []),
			]);
		}
	});

	inlineChoiceSpan.addEventListener("mouseenter", () => {
		const choiceText = inlineChoiceSpan.textContent || token.id;
		app.ghostController?.sendShioriEvent("OnChoiceEnter", [
			choiceText,
			token.id,
			...(token.args || []),
		]);
		if (hoverTimer) clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => {
			app.ghostController?.sendShioriEvent("OnChoiceHover", [
				choiceText,
				token.id,
				...(token.args || []),
			]);
			hoverTimer = null;
		}, 500);
	});

	inlineChoiceSpan.addEventListener("mouseleave", () => {
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
		app.ghostController?.sendShioriEvent("OnChoiceEnter", []);
	});

	currentBalloonText.appendChild(inlineChoiceSpan);
	context.currentAnchor = inlineChoiceSpan;
	context.currentChoiceScope = inlineChoiceSpan;
	flushDesktopBalloon();
	scheduleDesktopBalloonSync(false);

	if (player.choiceTimeout > 0 && !player.choiceTimeoutTimer) {
		player.choiceTimeoutTimer = setTimeout(() => {
			player.onChoiceTimeout();
		}, player.choiceTimeout);
	}
}

export function handleChoiceScopeEnd(
	_player: any,
	_app: any,
	_token: any,
	context: any,
) {
	if (context.currentAnchor === context.currentChoiceScope) {
		context.currentAnchor = null;
	}
	context.currentChoiceScope = null;
}
