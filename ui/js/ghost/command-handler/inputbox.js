export function openInputBox(handler, params) {
	const id = params[0] || "UserInput";
	let timeoutMs = 0;
	let defaultText = "";
	let placeholder = "";

	for (let i = 1; i < params.length; i++) {
		const p = params[i] ?? "";
		if (p.startsWith("--timeout=")) {
			timeoutMs = Number.parseInt(p.replace("--timeout=", ""), 10) || 0;
		} else if (p.startsWith("--text=")) {
			defaultText = p.replace("--text=", "");
		} else if (p.startsWith("--placeholder=")) {
			placeholder = p.replace("--placeholder=", "");
		} else if (i === 1 && !p.startsWith("--")) {
			timeoutMs = Number.parseInt(p, 10) || 0;
		} else if (i === 2 && !p.startsWith("--")) {
			defaultText = p;
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
	input.placeholder = placeholder;
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
	const cleanup = () => {
		if (timer) clearTimeout(timer);
		form.remove();
	};

	const submit = async () => {
		const val = input.value;
		cleanup();
		if (id.startsWith("On")) {
			await handler.app.ghostController.sendShioriEvent(id, [val]);
		} else {
			await handler.app.ghostController.sendShioriEvent("OnUserInput", [
				id,
				val,
			]);
		}
	};

	const cancel = async () => {
		cleanup();
		await handler.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);
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

	if (timeoutMs > 0) {
		timer = setTimeout(() => {
			cleanup();
			handler.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);
		}, timeoutMs);
	}
}
