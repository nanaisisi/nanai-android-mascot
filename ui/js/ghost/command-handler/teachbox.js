export function openTeachBox(handler, params = [], options = {}) {
	const { notifyStart = true } = options;
	handler.closeTeachBox();
	if (handler.teachForm) return;

	if (notifyStart) {
		handler.app.ghostController?.sendShioriEvent("OnTeachStart").catch(() => {});
	}

	let defaultText = "";
	for (const p of params.slice(1)) {
		if (typeof p === "string" && p.startsWith("--text=")) {
			defaultText = p.replace("--text=", "");
		}
	}

	const balloon =
		handler.player.currentScope === 1
			? handler.app.elements.keroBalloonText
			: handler.app.elements.balloonText;
	if (!balloon) return;

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

	handler.teachForm = form;

	const cleanup = () => {
		form.remove();
		handler.teachForm = null;
	};

	const submit = async () => {
		const val = input.value;
		cleanup();
		handler.app.ghostController?.sendTeachInput?.(val);
	};

	const cancel = async () => {
		cleanup();
		await handler.app.ghostController?.sendShioriEvent("OnTeachInputCancel", [
			"",
			"cancel",
		]);
		handler.app.ghostController?.clearTeachHistory?.();
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
	setTimeout(() => input.focus(), 50);
}

export function closeTeachBox(handler) {
	if (handler.teachForm) {
		handler.teachForm.remove();
		handler.teachForm = null;
	}
}
