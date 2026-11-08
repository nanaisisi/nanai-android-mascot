/**
 * @file modal-dialog-communication.js
 * @brief teachbox および communicatebox の管理
 */

export function openTeachBox(params = [], options = {}) {
	const { notifyStart = true, scope } = options;
	this.closeTeachBox(false);

	if (notifyStart) {
		this.app.ghostController?.sendShioriEvent("OnTeachStart")?.catch(() => {});
	}

	const opts = this.parseBoxOptions(["Teach", ...params]);
	let defaultText = opts.defaultText;
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

	input.addEventListener("focus", () => {
		try {
			form.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
		} catch {}
	});

	const submitBtn = document.createElement("button");
	submitBtn.textContent = "OK";
	submitBtn.className = "balloon-choice-btn";
	submitBtn.style.marginTop = "0";

	let dataListEl = null;
	const cleanup = () => {
		if (dataListEl) {
			dataListEl.remove?.();
			dataListEl = null;
		}
		form.remove();
		this.activeBoxes.delete("teachbox");
	};

	const submit = async () => {
		const val = input.value;
		cleanup();
		this.app.ghostController?.sendTeachInput?.(val);
	};

	let timer = null;
	const cancel = async (reason = "cancel") => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		cleanup();
		await this.app.ghostController?.sendShioriEvent("OnTeachInputCancel", [
			"",
			reason,
			...opts.references,
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

	this.attachAutocomplete(input, "teachbox", "", form).then((dl) => {
		dataListEl = dl;
	});

	if (opts.timeoutMs > 0) {
		timer = setTimeout(() => {
			cancel("timeout");
		}, opts.timeoutMs);
	}

	this.activeBoxes.set("teachbox", {
		type: "teachbox",
		form,
		cleanup: (_force = true) => {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			cleanup();
		},
	});
	return form;
}

export function closeTeachBox(notifyCancel = false) {
	const existing = this.activeBoxes.get("teachbox");
	if (existing) {
		try {
			existing.cleanup();
		} catch {}
		this.activeBoxes.delete("teachbox");
		if (notifyCancel) {
			this.app.ghostController?.sendShioriEvent("OnTeachInputCancel", [
				"",
				"close",
			]);
			this.app.ghostController?.clearTeachHistory?.();
		}
	}
}

export function openCommunicateBox(params = [], scope) {
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

	input.addEventListener("focus", () => {
		try {
			form.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
		} catch {}
	});

	const submitBtn = document.createElement("button");
	submitBtn.textContent = "送信";
	submitBtn.className = "balloon-choice-btn";
	submitBtn.style.marginTop = "0";

	let timer = null;
	let dataListEl = null;
	const cleanup = (force = false) => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		if (dataListEl) {
			dataListEl.remove?.();
			dataListEl = null;
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

	const cancel = async (reason = "cancel") => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		cleanup(true);
		await this.app.ghostController?.sendShioriEvent(
			"OnCommunicateInputCancel",
			["", reason, ...opts.references],
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

	this.attachAutocomplete(input, "communicatebox", "", form).then((dl) => {
		dataListEl = dl;
	});

	if (opts.timeoutMs > 0) {
		timer = setTimeout(() => {
			cancel("timeout");
		}, opts.timeoutMs);
	}

	this.activeBoxes.set("communicatebox", {
		type: "communicatebox",
		form,
		cleanup: () => cleanup(true),
	});
	return form;
}

export function closeCommunicateBox(notifyCancel = false) {
	const existing = this.activeBoxes.get("communicatebox");
	if (existing) {
		try {
			existing.cleanup(true);
		} catch {}
		this.activeBoxes.delete("communicatebox");
		if (notifyCancel) {
			this.app.ghostController?.sendShioriEvent("OnCommunicateInputCancel", [
				"",
				"close",
			]);
		}
	}
}
