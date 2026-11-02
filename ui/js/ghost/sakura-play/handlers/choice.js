/**
 * @file choice.js
 * @brief さくらスクリプト再生時の選択肢(\q)およびアンカー(\_a)要素生成・イベントハンドラ
 */

export function handleChoice(player, app, token, context) {
	const { currentBalloonText, flushDesktopBalloon } = context;

	const choiceBtn = document.createElement("button");
	choiceBtn.className = "balloon-choice-btn";
	choiceBtn.setAttribute("data-choice-id", token.id);
	choiceBtn.textContent = token.text;
	let hoverTimer = null;
	choiceBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
		if (player.choiceTimeoutTimer) {
			clearTimeout(player.choiceTimeoutTimer);
			player.choiceTimeoutTimer = null;
		}
		player.onChoiceSelected(token.id, token.text);
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

export function handleAnchorBegin(_player, app, token, context) {
	const { currentBalloonText, scheduleDesktopBalloonSync } = context;

	const anchorSpan = document.createElement("span");
	anchorSpan.className = "balloon-anchor";
	anchorSpan.dataset.anchorId = token.id;
	anchorSpan.setAttribute("data-anchor-id", token.id);
	let hoverTimer = null;
	anchorSpan.addEventListener("click", (e) => {
		e.stopPropagation();
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
		app.ghostController.sendShioriEvent("OnAnchorSelect", [
			token.id,
			...(token.args || []),
		]);
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

export function handleAnchorEnd(_player, _app, _token, context) {
	context.currentAnchor = null;
}
