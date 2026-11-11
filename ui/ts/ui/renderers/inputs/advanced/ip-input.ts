/**
 * @file ip-input.js
 * @brief ipinput の表示・制御処理
 */

export function openIpInput(
	this: unknown,
	params: string | unknown[],
	scope: unknown,
) {
	const id = params[0] || "IpInput";
	let timeoutMs = 0;
	const ipParts = ["", "", "", ""];
	let noClose = false;
	const references: string[] = [];

	for (let i = 1; i < params.length; i++) {
		const p = params[i] ?? "";
		if (typeof p !== "string") continue;

		if (p.startsWith("--timeout=")) {
			timeoutMs = Number.parseInt(p.replace("--timeout=", ""), 10) || 0;
		} else if (p.startsWith("--text=")) {
			const parts = p.replace("--text=", "").split(".");
			for (let j = 0; j < 4; j++) {
				if (parts[j] !== undefined) ipParts[j] = parts[j].trim();
			}
		} else if (p.startsWith("--reference=")) {
			references.push(p.replace("--reference=", ""));
		} else if (p.startsWith("--option=")) {
			if (p.toLowerCase().includes("noclose")) noClose = true;
		} else if (i === 1 && !p.startsWith("--")) {
			timeoutMs = Number.parseInt(p, 10) || 0;
		} else if (i >= 2 && i <= 5 && !p.startsWith("--")) {
			ipParts[i - 2] = p.trim();
		}
	}

	this.closeInputBox(id);
	const balloon = this.getBalloonContainer(scope);
	if (!balloon) return null;

	const form = document.createElement("div");
	form.className = "balloon-inputbox-form balloon-ipinput-form";
	form.style.marginTop = "0.5rem";
	form.style.display = "flex";
	form.style.alignItems = "center";
	form.style.gap = "0.15rem";

	const inputs: { focus: () => unknown }[] | HTMLInputElement[] = [];
	for (let i = 0; i < 4; i++) {
		const field = document.createElement("input");
		field.type = "number";
		field.min = "0";
		field.max = "255";
		field.className = "balloon-input balloon-ip-octet";
		field.value = ipParts[i] || "";
		field.style.width = "2.5rem";
		field.style.textAlign = "center";
		field.style.fontSize = "0.8rem";
		field.style.padding = "0.2rem";
		field.style.borderRadius = "0.25rem";
		field.style.border = "1px solid var(--balloon-border-color, #888)";
		field.style.background = "var(--balloon-bg, #fff)";
		field.style.color = "var(--balloon-text-color, #000)";

		field.addEventListener("focus", () => {
			try {
				form.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
			} catch {}
		});

		field.addEventListener("keydown", (e) => {
			if (e.key === "." || e.key === "Decimal") {
				e.preventDefault();
				if (i < 3) inputs[i + 1]?.focus();
			} else if (e.key === "Backspace" && field.value === "" && i > 0) {
				inputs[i - 1]?.focus();
			}
		});

		inputs.push(field);
		form.appendChild(field);

		if (i < 3) {
			const dot = document.createElement("span");
			dot.textContent = ".";
			dot.style.fontWeight = "bold";
			form.appendChild(dot);
		}
	}

	const submitBtn = document.createElement("button");
	submitBtn.textContent = "OK";
	submitBtn.className = "balloon-choice-btn";
	submitBtn.style.marginTop = "0";

	let timer: number | null | undefined = null;
	const boxKey = `inputbox:${id}`;

	const cleanup = (force = false) => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		if (force || !noClose) {
			form.remove();
			this.activeBoxes.delete(boxKey);
			if (this.activeBoxes.get("inputbox")?.form === form) {
				this.activeBoxes.delete("inputbox");
			}
		}
	};

	const submit = async () => {
		const val = inputs
			.map((inp) => {
				const num = Number.parseInt(inp.value, 10);
				return Number.isNaN(num) ? 0 : Math.min(255, Math.max(0, num));
			})
			.join(",");
		cleanup();
		if (id.startsWith("On")) {
			await this.app.ghostController?.sendShioriEvent(id, [
				val,
				"",
				...references,
			]);
		} else {
			await this.app.ghostController?.sendShioriEvent("OnUserInput", [
				id,
				val,
				"",
				...references,
			]);
		}
	};

	const cancel = async (reason = "close") => {
		cleanup(true);
		await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [
			id,
			reason,
			"",
			...references,
		]);
	};

	submitBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		submit();
	});

	form.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.stopPropagation();
			submit();
		} else if (e.key === "Escape") {
			e.stopPropagation();
			cancel("close");
		}
	});

	form.appendChild(submitBtn);
	balloon.appendChild(form);
	setTimeout(() => inputs[0]?.focus?.(), 50);

	if (timeoutMs > 0) {
		timer = setTimeout(() => {
			cancel("timeout");
		}, timeoutMs);
	}

	const boxEntry = {
		id,
		type: "ipinput",
		form,
		cleanup: () => cleanup(true),
	};
	this.activeBoxes.set(boxKey, boxEntry);
	this.activeBoxes.set("inputbox", boxEntry);
	return form;
}
