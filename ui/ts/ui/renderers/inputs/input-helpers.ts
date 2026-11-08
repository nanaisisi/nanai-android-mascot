/**
 * @file input-helpers.js
 * @brief inputbox autocomplete および parseBoxOptions ヘルパー処理
 */

export async function attachAutocomplete(
	inputEl,
	boxType,
	id = "",
	parentForm = null,
) {
	if (!this.app?.ghostController?.sendShioriEvent || !inputEl) return null;
	try {
		const res = await this.app.ghostController.sendShioriEvent(
			"inputbox.autocomplete",
			boxType === "inputbox" ? [boxType, id] : [boxType],
		);
		const rawVal =
			typeof res === "string"
				? res
				: res?.value || res?.response || res?.toString?.() || "";
		if (!rawVal || typeof rawVal !== "string") return null;

		const byteOne = String.fromCharCode(1);
		const items = rawVal
			.replaceAll("\\1", byteOne)
			.split(byteOne)
			.map((s) => s.trim())
			.filter(Boolean);

		if (items.length === 0) return null;

		const listId = `dl-${boxType}-${++this.autocompleteCounter}`;
		const dataList = document.createElement("datalist");
		dataList.id = listId;

		for (const item of items) {
			const opt = document.createElement("option");
			opt.value = item;
			dataList.appendChild(opt);
		}

		inputEl.setAttribute("list", listId);
		if (parentForm) {
			parentForm.appendChild(dataList);
		} else {
			inputEl.parentElement?.appendChild(dataList);
		}
		return dataList;
	} catch {
		return null;
	}
}

export function parseBoxOptions(params) {
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
			const rawOptions = p
				.replace("--option=", "")
				.toLowerCase()
				.split(/[,|;]/);
			for (const opt of rawOptions) {
				const trimmed = opt.trim();
				if (trimmed === "noclose" || trimmed.includes("noclose"))
					noClose = true;
				if (trimmed === "noclear" || trimmed.includes("noclear"))
					noClear = true;
			}
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
