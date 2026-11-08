/**
 * @file choice.ts
 * @brief さくらスクリプト再生時の選択肢(\q)およびアンカー(\_a)要素生成・イベントハンドラ
 */


export function handleChoice(
	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,
) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _handleChoice(player: any, app: any, token: any, context: any) {

	const { currentBalloonText, flushDesktopBalloon } = context;

	const choiceBtn = document.createElement("button");
	choiceBtn.className = "balloon-choice-btn";
	choiceBtn.setAttribute("data-choice-id", token.id);
	choiceBtn.textContent = token.text;

	const _hoverTimer: unknown = null;

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	let hoverTimer: any = null;

	choiceBtn.addEventListener("click", (e: MouseEvent) =>
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

export function _handleAnchorBegin(

	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	context: any,

) {
	const { currentBalloonText, scheduleDesktopBalloonSync } = context;

	const anchorSpan = document.createElement("span");
	anchorSpan.className = "balloon-anchor";
	anchorSpan.dataset.anchorId = token.id;
	anchorSpan.setAttribute("data-anchor-id", token.id);

	const _hoverTimer: unknown = null;

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
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

			const _resEx: unknown = await app.ghostController.sendShioriEvent(

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
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

	_player: unknown,
	_app: unknown,
	_token: unknown,
	context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	context: any,

)
	context.currentAnchor = null;
