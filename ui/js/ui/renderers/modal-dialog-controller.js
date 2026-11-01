/**
 * @file modal-dialog-controller.js
 * @brief さくらスクリプトおよびUIからの各種ダイアログ（inputbox, teachbox, communicatebox, 選択肢リスト）を統括管理するコントローラー
 */

export class ModalDialogController {
	/**
	 * @param {object} options
	 * @param {object} options.app アプリケーションインスタンス
	 * @param {object} [options.player] さくらスクリプトプレイヤー
	 */
	constructor({ app, player = null }) {
		this.app = app;
		this.player = player;
		this.activeBoxes = new Map();
		this.choiceTimeoutTimer = null;
	}

	/**
	 * 対象のバルーンテキスト要素を取得
	 * @param {number} [scope]
	 * @returns {HTMLElement|null}
	 */
	getBalloonContainer(scope = 0) {
		const targetScope =
			typeof scope === "number" ? scope : (this.player?.currentScope ?? 0);
		return targetScope === 1
			? this.app?.elements?.keroBalloonText
			: this.app?.elements?.balloonText;
	}

	/**
	 * 入力ボックスオプションのパース
	 * @param {string[]} params
	 * @returns {object}
	 */
	parseBoxOptions(params) {
		const id = params[0] || "UserInput";
		let timeoutMs = 0;
		let defaultText = "";
		let placeholder = "";
		let limit = 0;
		let noClose = false;
		let noClear = false;
		const references = [];

		for (let i = 1; i < params.length; i++) {
			const p = params[i] ?? "";
			if (typeof p !== "string") continue;

			if (p.startsWith("--timeout=")) {
				timeoutMs = Number.parseInt(p.replace("--timeout=", ""), 10) || 0;
			} else if (p.startsWith("--text=")) {
				defaultText = p.replace("--text=", "");
			} else if (p.startsWith("--placeholder=")) {
				placeholder = p.replace("--placeholder=", "");
			} else if (p.startsWith("--limit=")) {
				limit = Number.parseInt(p.replace("--limit=", ""), 10) || 0;
			} else if (p.startsWith("--reference=")) {
				references.push(p.replace("--reference=", ""));
			} else if (p.startsWith("--option=")) {
				const opt = p.replace("--option=", "").toLowerCase();
				if (opt.includes("noclose")) noClose = true;
				if (opt.includes("noclear")) noClear = true;
			} else if (i === 1 && !p.startsWith("--")) {
				timeoutMs = Number.parseInt(p, 10) || 0;
			} else if (i === 2 && !p.startsWith("--")) {
				defaultText = p;
			}
		}

		return {
			id,
			timeoutMs,
			defaultText,
			placeholder,
			limit,
			noClose,
			noClear,
			references,
		};
	}

	/**
	 * InputBox を開く (\![open,inputbox])
	 * @param {string[]} params
	 * @param {number} [scope]
	 * @returns {HTMLElement|null}
	 */
	openInputBox(params, scope) {
		this.closeInputBox();
		const opts = this.parseBoxOptions(params);
		const balloon = this.getBalloonContainer(scope);
		if (!balloon) return null;

		const form = document.createElement("div");
		form.className = "balloon-inputbox-form";
		form.style.marginTop = "0.5rem";
		form.style.display = "flex";
		form.style.gap = "0.25rem";

		const input = document.createElement("input");
		input.type = "text";
		input.className = "balloon-input";
		input.value = opts.defaultText;
		input.placeholder = opts.placeholder;
		if (opts.limit > 0) input.maxLength = opts.limit;
		input.style.flex = "1";
		input.style.fontSize = "0.8rem";
		input.style.padding = "0.2rem 0.4rem";
		input.style.borderRadius = "0.25rem";
		input.style.border = "1px solid var(--balloon-border-color, #888)";
		input.style.background = "var(--balloon-bg, #fff)";
		input.style.color = "var(--balloon-text-color, #000)";

		const submitBtn = document.createElement("button");
		submitBtn.textContent = "OK";
		submitBtn.className = "balloon-choice-btn";
		submitBtn.style.marginTop = "0";

		let timer = null;
		const cleanup = (force = false) => {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			if (force || !opts.noClose) {
				form.remove();
				this.activeBoxes.delete("inputbox");
			} else if (!opts.noClear) {
				input.value = "";
			}
		};

		const submit = async () => {
			const val = input.value;
			cleanup();
			if (opts.id.startsWith("On")) {
				await this.app.ghostController?.sendShioriEvent(opts.id, [
					val,
					...opts.references,
				]);
			} else {
				await this.app.ghostController?.sendShioriEvent("OnUserInput", [
					opts.id,
					val,
					"",
					...opts.references,
				]);
			}
		};

		const cancel = async () => {
			cleanup(true);
			await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [
				opts.id,
				"cancel",
			]);
		};

		submitBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			submit();
		});

		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.stopPropagation();
				submit();
			} else if (e.key === "Escape") {
				e.stopPropagation();
				cancel();
			}
		});

		form.appendChild(input);
		form.appendChild(submitBtn);
		balloon.appendChild(form);
		setTimeout(() => input.focus?.(), 50);

		if (opts.timeoutMs > 0) {
			timer = setTimeout(() => {
				cancel();
			}, opts.timeoutMs);
		}

		this.activeBoxes.set("inputbox", { form, cleanup: () => cleanup(true) });
		return form;
	}

	/**
	 * InputBox を閉じる
	 */
	closeInputBox() {
		const existing = this.activeBoxes.get("inputbox");
		if (existing) {
			existing.cleanup();
			this.activeBoxes.delete("inputbox");
		}
	}

	/**
	 * TeachBox を開く (\![open,teachbox])
	 * @param {string[]} [params]
	 * @param {object} [options]
	 * @returns {HTMLElement|null}
	 */
	openTeachBox(params = [], options = {}) {
		const { notifyStart = true, scope } = options;
		this.closeTeachBox();

		if (notifyStart) {
			this.app.ghostController
				?.sendShioriEvent("OnTeachStart")
				?.catch(() => {});
		}

		let defaultText = "";
		for (const p of params) {
			if (typeof p === "string" && p.startsWith("--text=")) {
				defaultText = p.replace("--text=", "");
			}
		}

		const balloon = this.getBalloonContainer(scope);
		if (!balloon) return null;

		const form = document.createElement("div");
		form.className = "balloon-inputbox-form";
		form.style.marginTop = "0.5rem";
		form.style.display = "flex";
		form.style.gap = "0.25rem";

		const input = document.createElement("input");
		input.type = "text";
		input.className = "balloon-input";
		input.value = defaultText;
		input.placeholder = "教えて";
		input.style.flex = "1";
		input.style.fontSize = "0.8rem";
		input.style.padding = "0.2rem 0.4rem";
		input.style.borderRadius = "0.25rem";
		input.style.border = "1px solid var(--balloon-border-color, #888)";
		input.style.background = "var(--balloon-bg, #fff)";
		input.style.color = "var(--balloon-text-color, #000)";

		const submitBtn = document.createElement("button");
		submitBtn.textContent = "OK";
		submitBtn.className = "balloon-choice-btn";
		submitBtn.style.marginTop = "0";

		const cleanup = () => {
			form.remove();
			this.activeBoxes.delete("teachbox");
		};

		const submit = async () => {
			const val = input.value;
			cleanup();
			this.app.ghostController?.sendTeachInput?.(val);
		};

		const cancel = async () => {
			cleanup();
			await this.app.ghostController?.sendShioriEvent("OnTeachInputCancel", [
				"",
				"cancel",
			]);
			this.app.ghostController?.clearTeachHistory?.();
		};

		submitBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			submit();
		});

		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.stopPropagation();
				submit();
			} else if (e.key === "Escape") {
				e.stopPropagation();
				cancel();
			}
		});

		form.appendChild(input);
		form.appendChild(submitBtn);
		balloon.appendChild(form);
		setTimeout(() => input.focus?.(), 50);

		this.activeBoxes.set("teachbox", { form, cleanup });
		return form;
	}

	/**
	 * TeachBox を閉じる
	 */
	closeTeachBox() {
		const existing = this.activeBoxes.get("teachbox");
		if (existing) {
			existing.cleanup();
			this.activeBoxes.delete("teachbox");
		}
	}

	/**
	 * CommunicateBox を開く (\![open,communicatebox])
	 * @param {string[]} [params]
	 * @param {number} [scope]
	 * @returns {HTMLElement|null}
	 */
	openCommunicateBox(params = [], scope) {
		this.closeCommunicateBox(false);
		const opts = this.parseBoxOptions(["Communicate", ...params]);
		const balloon = this.getBalloonContainer(scope);
		if (!balloon) return null;

		const form = document.createElement("div");
		form.className = "balloon-inputbox-form balloon-communicatebox-form";
		form.style.marginTop = "0.5rem";
		form.style.display = "flex";
		form.style.gap = "0.25rem";

		const input = document.createElement("input");
		input.type = "text";
		input.className = "balloon-input";
		input.value = opts.defaultText;
		input.placeholder = opts.placeholder || "話しかける...";
		if (opts.limit > 0) input.maxLength = opts.limit;
		input.style.flex = "1";
		input.style.fontSize = "0.8rem";
		input.style.padding = "0.2rem 0.4rem";
		input.style.borderRadius = "0.25rem";
		input.style.border = "1px solid var(--balloon-border-color, #888)";
		input.style.background =
			"var(--communicatebox-background-color, var(--balloon-bg, #fff))";
		input.style.color =
			"var(--communicatebox-font-color, var(--balloon-text-color, #000))";

		const submitBtn = document.createElement("button");
		submitBtn.textContent = "送信";
		submitBtn.className = "balloon-choice-btn";
		submitBtn.style.marginTop = "0";

		let timer = null;
		const cleanup = (force = false) => {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			if (force || !opts.noClose) {
				form.remove();
				this.activeBoxes.delete("communicatebox");
			} else if (!opts.noClear) {
				input.value = "";
			}
		};

		const submit = async () => {
			const val = input.value;
			cleanup();
			await this.app.ghostController?.sendShioriEvent("OnCommunicate", [
				"user",
				val,
				...opts.references,
			]);
		};

		const cancel = async () => {
			cleanup(true);
			await this.app.ghostController?.sendShioriEvent(
				"OnCommunicateInputCancel",
				["", "cancel"],
			);
		};

		submitBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			submit();
		});

		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.stopPropagation();
				submit();
			} else if (e.key === "Escape") {
				e.stopPropagation();
				cancel();
			}
		});

		form.appendChild(input);
		form.appendChild(submitBtn);
		balloon.appendChild(form);
		setTimeout(() => input.focus?.(), 50);

		if (opts.timeoutMs > 0) {
			timer = setTimeout(() => {
				cancel();
			}, opts.timeoutMs);
		}

		this.activeBoxes.set("communicatebox", {
			form,
			cleanup: () => cleanup(true),
		});
		return form;
	}

	/**
	 * CommunicateBox を閉じる (\![close,communicatebox])
	 * ※スクリプトからの close では OnCommunicateInputCancel は発生しない (UKADOC準拠)
	 */
	closeCommunicateBox(notifyCancel = false) {
		const existing = this.activeBoxes.get("communicatebox");
		if (existing) {
			existing.cleanup();
			this.activeBoxes.delete("communicatebox");
			if (notifyCancel) {
				this.app.ghostController?.sendShioriEvent("OnCommunicateInputCancel", [
					"",
					"cancel",
				]);
			}
		}
	}

	/**
	 * 選択肢 (Choice) ボタン要素を生成
	 * @param {object} param
	 * @param {string} param.id 選択肢ID
	 * @param {string} param.text 表示テキスト
	 * @param {function} [param.onSelect] 選択時のコールバック
	 * @returns {HTMLButtonElement}
	 */
	createChoiceButton({ id, text, onSelect }) {
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
				this.app.ghostController?.sendShioriEvent("OnChoiceSelect", [id, text]);
			}
		});
		return btn;
	}

	/**
	 * 選択肢のタイムアウトタイマーを設定
	 * @param {number} timeoutMs
	 * @param {function} [onTimeout]
	 */
	setChoiceTimeout(timeoutMs, onTimeout) {
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

	/**
	 * 全ての開いているアクティブなボックスを閉じる
	 */
	closeAll() {
		for (const box of this.activeBoxes.values()) {
			box.cleanup();
		}
		this.activeBoxes.clear();
		if (this.choiceTimeoutTimer) {
			clearTimeout(this.choiceTimeoutTimer);
			this.choiceTimeoutTimer = null;
		}
	}
}
