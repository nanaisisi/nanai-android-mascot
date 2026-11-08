/**
 * @file modal-dialog-choices.js
 * @brief 選択肢ボタン、タイムアウト処理、および一般ダイアログ閉鎖メソッド
 */

export function closeDialog(id, notifyCancel = true) {
	if (!id || id === "__SYSTEM_ALL_DIALOG__") {
		const keys = Array.from(this.activeBoxes.keys());
		let closedAny = false;
		for (const key of keys) {
			const box = this.activeBoxes.get(key);
			if (box) {
				box.cleanup(true);
				this.activeBoxes.delete(key);
				closedAny = true;
			}
		}
		if (notifyCancel && closedAny) {
			this.app.ghostController?.sendShioriEvent("OnSystemDialogCancel", [
				id || "__SYSTEM_ALL_DIALOG__",
			]);
		}
		return;
	}

	let closed = false;
	for (const [key, box] of Array.from(this.activeBoxes.entries())) {
		if (box.id === id || key === `dialog:${id}` || key.endsWith(`:${id}`)) {
			box.cleanup(true);
			this.activeBoxes.delete(key);
			closed = true;
		}
	}
	if (closed && notifyCancel) {
		this.app.ghostController?.sendShioriEvent("OnSystemDialogCancel", [id]);
	}
}

export function createChoiceButton({ id, text, onSelect }) {
	const btn = document.createElement("button");
	btn.className = "balloon-choice-btn";
	btn.setAttribute("data-choice-id", id);
	btn.textContent = text;
	btn.addEventListener("click", (e) => {
		e.stopPropagation();
		if (this.choiceTimeoutTimer) {
			clearTimeout(this.choiceTimeoutTimer);
			this.choiceTimeoutTimer = null;
		}
		if (onSelect) {
			onSelect(id, text);
		} else if (this.player?.onChoiceSelected) {
			this.player.onChoiceSelected(id, text);
		} else {
			this.app.ghostController?.sendShioriEvent?.("OnChoiceSelectEx", [
				text,
				id,
			]);
			this.app.ghostController?.sendShioriEvent("OnChoiceSelect", [id, text]);
		}
	});
	return btn;
}

export function setChoiceTimeout(timeoutMs, onTimeout) {
	if (this.choiceTimeoutTimer) {
		clearTimeout(this.choiceTimeoutTimer);
		this.choiceTimeoutTimer = null;
	}
	if (timeoutMs > 0) {
		this.choiceTimeoutTimer = setTimeout(() => {
			this.choiceTimeoutTimer = null;
			if (onTimeout) {
				onTimeout();
			} else {
				this.app.ghostController?.sendShioriEvent("OnChoiceTimeout", []);
			}
		}, timeoutMs);
	}
}

export function closeAll() {
	for (const box of this.activeBoxes.values()) {
		box.cleanup();
	}
	this.activeBoxes.clear();
	if (this.choiceTimeoutTimer) {
		clearTimeout(this.choiceTimeoutTimer);
		this.choiceTimeoutTimer = null;
	}
}
