/**
 * @file modal-dialog-choices.js
 * @brief 選択肢ボタン、タイムアウト処理、および一般ダイアログ閉鎖メソッド
 */

import type { ModalDialogControllerContext } from "./modal-dialog-ui.js";

export interface ChoiceButtonOptions {
	id: string;
	text: string;
	onSelect?: (id: string, text: string) => void;
}

export function closeDialog(
	this: ModalDialogControllerContext,
	id?: string,
	notifyCancel = true,
) {
	if (!id || id === "__SYSTEM_ALL_DIALOG__") {
		const keys = Array.from(this.activeBoxes.keys());
		let closedAny = false;
		for (const key of keys) {
			const box = this.activeBoxes.get(key);
			if (box) {
				try {
					box.cleanup(true);
				} catch {}
				this.activeBoxes.delete(key);
				closedAny = true;
			}
		}
		if (notifyCancel && closedAny) {
			this.app?.ghostController?.sendShioriEvent?.("OnSystemDialogCancel", [
				id || "__SYSTEM_ALL_DIALOG__",
			]);
		}
		return;
	}

	let closed = false;
	for (const [key, box] of Array.from(this.activeBoxes.entries())) {
		if (box.id === id || key === `dialog:${id}` || key.endsWith(`:${id}`)) {
			try {
				box.cleanup(true);
			} catch {}
			this.activeBoxes.delete(key);
			closed = true;
		}
	}
	if (closed && notifyCancel) {
		this.app?.ghostController?.sendShioriEvent?.("OnSystemDialogCancel", [id]);
	}
}

export function createChoiceButton(
	this: ModalDialogControllerContext,
	{ id, text, onSelect }: ChoiceButtonOptions,
): HTMLButtonElement {
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
			this.app?.ghostController?.sendShioriEvent?.("OnChoiceSelectEx", [
				text,
				id,
			]);
			this.app?.ghostController?.sendShioriEvent?.("OnChoiceSelect", [
				id,
				text,
			]);
		}
	});
	return btn;
}

export function setChoiceTimeout(
	this: ModalDialogControllerContext,
	timeoutMs?: number,
	onTimeout?: () => void,
) {
	if (this.choiceTimeoutTimer) {
		clearTimeout(this.choiceTimeoutTimer);
		this.choiceTimeoutTimer = null;
	}
	if (timeoutMs && timeoutMs > 0) {
		this.choiceTimeoutTimer = setTimeout(() => {
			this.choiceTimeoutTimer = null;
			if (onTimeout) {
				onTimeout();
			} else {
				this.app?.ghostController?.sendShioriEvent?.("OnChoiceTimeout", []);
			}
		}, timeoutMs);
	}
}

export function closeAll(this: ModalDialogControllerContext) {
	for (const box of this.activeBoxes.values()) {
		try {
			box.cleanup();
		} catch {}
	}
	this.activeBoxes.clear();
	if (this.choiceTimeoutTimer) {
		clearTimeout(this.choiceTimeoutTimer);
		this.choiceTimeoutTimer = null;
	}
}
