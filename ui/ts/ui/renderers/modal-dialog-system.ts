/**
 * @file modal-dialog-system.js
 * @brief \![open,dialog,open/save/folder/color,...] システムダイアログ処理
 * UKADOC OnSystemDialog / OnSystemDialogCancel 準拠
 */

/**
 * システムダイアログを開く (\![open,dialog,dialogType,...])
 * @param {string} dialogType - "open" | "save" | "folder" | "color"
 * @param {string[]} params - オプション引数群
 * @param {number} [scope]
 * @returns {Promise<unknown>}
 */
export async function openSystemDialog(dialogType, params = [], scope) {
	const type = (dialogType || "open").toLowerCase();
	let id = "";
	let title = "";
	let dir = "";
	let filter = "";
	let ext = "";
	let defaultName = "";
	let initialColor = "#000000";

	// 既定のタイトル
	if (type === "open") title = "Open File";
	else if (type === "save") title = "Save File";
	else if (type === "folder") title = "Select Folder";
	else if (type === "color") title = "色の設定";
	else if (type === "terms") title = "利用規約";

	for (const p of params) {
		if (typeof p !== "string") continue;
		if (p.startsWith("--id=")) {
			id = p.replace("--id=", "");
		} else if (p.startsWith("--title=")) {
			title = p.replace("--title=", "");
		} else if (p.startsWith("--dir=")) {
			dir = p.replace("--dir=", "");
		} else if (p.startsWith("--filter=")) {
			filter = p.replace("--filter=", "");
		} else if (p.startsWith("--ext=")) {
			ext = p.replace("--ext=", "");
		} else if (p.startsWith("--name=")) {
			defaultName = p.replace("--name=", "");
		} else if (p.startsWith("--color=")) {
			const rawColor = p.replace("--color=", "").trim();
			// "255 0 0" または "255,0,0" または "#rrggbb"
			if (rawColor.startsWith("#")) {
				initialColor = rawColor;
			} else {
				const parts = rawColor.split(/[\s,]+/).map(Number);
				if (parts.length >= 3) {
					const [r, g, b] = parts;
					initialColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
				}
			}
		}
	}

	const eventId = id || type;

	const sendSuccess = async (resultValue) => {
		if (id?.startsWith("On")) {
			await this.app?.ghostController?.sendShioriEvent(id, [
				type,
				id,
				resultValue,
			]);
		} else {
			await this.app?.ghostController?.sendShioriEvent("OnSystemDialog", [
				type,
				eventId,
				resultValue,
			]);
		}
	};

	const sendCancel = async () => {
		if (id?.startsWith("On")) {
			await this.app?.ghostController?.sendShioriEvent(`${id}Cancel`, [
				type,
				id,
			]);
		} else {
			await this.app?.ghostController?.sendShioriEvent("OnSystemDialogCancel", [
				type,
				eventId,
			]);
		}
	};

	// 1. カラーピッカー (HTML5 <input type="color"> またはバルーン内ピッカー)
	if (type === "color") {
		const balloon = this.getBalloonContainer(scope);
		const form = document.createElement("div");
		form.className = "balloon-inputbox-form balloon-color-dialog";
		form.style.marginTop = "0.5rem";
		form.style.display = "flex";
		form.style.alignItems = "center";
		form.style.gap = "0.5rem";

		if (title) {
			const label = document.createElement("span");
			label.textContent = title;
			label.style.fontSize = "0.8rem";
			form.appendChild(label);
		}

		const colorInput = document.createElement("input");
		colorInput.type = "color";
		colorInput.value = initialColor;
		colorInput.style.cursor = "pointer";
		colorInput.style.border = "none";
		colorInput.style.background = "none";
		colorInput.style.width = "2rem";
		colorInput.style.height = "2rem";

		const submitBtn = document.createElement("button");
		submitBtn.textContent = "OK";
		submitBtn.className = "balloon-choice-btn";
		submitBtn.style.marginTop = "0";

		const cancelBtn = document.createElement("button");
		cancelBtn.textContent = "Cancel";
		cancelBtn.className = "balloon-choice-btn";
		cancelBtn.style.marginTop = "0";

		const boxKey = `dialog:${eventId}`;
		const cleanup = () => {
			form.remove();
			this.activeBoxes.delete(boxKey);
		};

		submitBtn.addEventListener("click", async (e) => {
			e.stopPropagation();
			const hex = colorInput.value.replace("#", "");
			const r = Number.parseInt(hex.slice(0, 2), 16) || 0;
			const g = Number.parseInt(hex.slice(2, 4), 16) || 0;
			const b = Number.parseInt(hex.slice(4, 6), 16) || 0;
			const rgbStr = `${r},${g},${b}`;
			cleanup();
			await sendSuccess(rgbStr);
		});

		cancelBtn.addEventListener("click", async (e) => {
			e.stopPropagation();
			cleanup();
			await sendCancel();
		});

		form.appendChild(colorInput);
		form.appendChild(submitBtn);
		form.appendChild(cancelBtn);

		if (balloon) {
			balloon.appendChild(form);
			this.activeBoxes.set(boxKey, {
				id: eventId,
				type: "color",
				form,
				cleanup: () => {
					cleanup();
					sendCancel();
				},
			});
			return form;
		}

		// バルーン不在時のプロンプト / 仮想フォールバック
		const hex = initialColor.replace("#", "");
		const r = Number.parseInt(hex.slice(0, 2), 16) || 0;
		const g = Number.parseInt(hex.slice(2, 4), 16) || 0;
		const b = Number.parseInt(hex.slice(4, 6), 16) || 0;
		await sendSuccess(`${r},${g},${b}`);
		return null;
	}

	// 1.5. 利用条件ダイアログ (terms)
	if (type === "terms") {
		const balloon = this.getBalloonContainer(scope);
		const form = document.createElement("div");
		form.className = "balloon-inputbox-form balloon-terms-dialog";
		form.style.marginTop = "0.5rem";
		form.style.display = "flex";
		form.style.flexDirection = "column";
		form.style.gap = "0.5rem";

		if (title) {
			const label = document.createElement("span");
			label.textContent = title;
			label.style.fontWeight = "bold";
			form.appendChild(label);
		}

		const btnRow = document.createElement("div");
		btnRow.style.display = "flex";
		btnRow.style.gap = "0.5rem";

		const acceptBtn = document.createElement("button");
		acceptBtn.textContent = "同意する";
		acceptBtn.className = "balloon-choice-btn";

		const declineBtn = document.createElement("button");
		declineBtn.textContent = "同意しない";
		declineBtn.className = "balloon-choice-btn";

		btnRow.appendChild(acceptBtn);
		btnRow.appendChild(declineBtn);
		form.appendChild(btnRow);

		const boxKey = `dialog:${eventId}`;
		const cleanup = () => {
			form.remove();
			this.activeBoxes.delete(boxKey);
		};

		acceptBtn.addEventListener("click", async (e) => {
			e.stopPropagation();
			cleanup();
			await this.app?.ghostController?.sendShioriEvent?.(
				"OnGhostTermsAccept",
				id ? [id] : [],
			);
		});

		declineBtn.addEventListener("click", async (e) => {
			e.stopPropagation();
			cleanup();
			await this.app?.ghostController?.sendShioriEvent?.(
				"OnGhostTermsDecline",
				id ? [id] : [],
			);
		});

		if (balloon) {
			balloon.appendChild(form);
			this.activeBoxes.set(boxKey, {
				id: eventId,
				type: "terms",
				form,
				cleanup: () => {
					cleanup();
					// 右上の閉じる等ではイベントを発生させない (UKADOC規約)
				},
			});
			return form;
		}

		await this.app?.ghostController?.sendShioriEvent?.(
			"OnGhostTermsAccept",
			id ? [id] : [],
		);
		return null;
	}

	// 2. ファイル / フォルダ選択 (open, save, folder)
	// ブラウザ / DOM 環境の input[type=file] によるフォールバック
	if (typeof document !== "undefined") {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.style.display = "none";
		if (type === "folder") {
			fileInput.setAttribute("webkitdirectory", "");
			fileInput.setAttribute("directory", "");
		}
		if (filter) {
			// filter形式: "テキスト|*.txt;*.dic|すべて|*.*"
			const exts = [];
			const parts = filter.split("|");
			for (let i = 1; i < parts.length; i += 2) {
				const patterns = parts[i].split(";");
				for (const p of patterns) {
					const clean = p.trim().replace(/^\*/, "");
					if (clean && clean !== ".*") exts.push(clean);
				}
			}
			if (exts.length > 0) {
				fileInput.accept = exts.join(",");
			}
		}

		let resolved = false;
		fileInput.addEventListener("change", async () => {
			resolved = true;
			const file = fileInput.files?.[0];
			fileInput.remove();
			if (file) {
				const filePath = file.path || file.name;
				await sendSuccess(filePath);
			} else {
				await sendCancel();
			}
		});

		fileInput.addEventListener("cancel", async () => {
			resolved = true;
			fileInput.remove();
			await sendCancel();
		});

		document.body?.appendChild(fileInput);
		// 登録して close:dialog 時に cancel できるようにする
		const boxKey = `dialog:${eventId}`;
		this.activeBoxes.set(boxKey, {
			id: eventId,
			type,
			form: fileInput,
			cleanup: () => {
				if (!resolved) {
					fileInput.remove();
					sendCancel();
				}
			},
		});

		// ユーザー操作によるオープン発火（環境によりclick可能）
		try {
			fileInput.click();
		} catch (_err) {
			// clickが制限される環境ではフォールバック
			if (defaultName || ext) {
				const mockPath = `${dir ? `${dir}/` : ""}${defaultName || "file"}${ext ? `.${ext.replace(/^\./, "")}` : ""}`;
				await sendSuccess(mockPath);
			}
		}
		return fileInput;
	}

	return null;
}
