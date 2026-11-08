/**
 * @file inputbox.ts
 * @brief \![open,inputbox] 等ハンドラ
 */

export function openInputBox(
<<<<<<< HEAD
	handler: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	handler: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	params: string[],
	isPassword: boolean = false,
) {
	if (isPassword && handler.app?.modalDialogController?.openPasswordInput) {
		return handler.app.modalDialogController.openPasswordInput(
			params,
			handler.player?.currentScope,
		);
	}
	if (handler.app?.modalDialogController?.openInputBox) {
		return handler.app.modalDialogController.openInputBox(
			params,
			handler.player?.currentScope,
			isPassword,
		);
	}

	const id = params[0] || "UserInput";
	let timeoutMs = 0;
	let defaultText = "";
	let placeholder = "";
	const references: string[] = [];

	for (let i = 1; i < params.length; i++) {
		const p = params[i] ?? "";
		if (typeof p !== "string") continue;
		if (p.startsWith("--timeout=")) {
			timeoutMs = Number.parseInt(p.replace("--timeout=", ""), 10) || 0;
		} else if (p.startsWith("--text=")) {
			defaultText = p.replace("--text=", "");
		} else if (p.startsWith("--placeholder=")) {
			placeholder = p.replace("--placeholder=", "");
		} else if (p.startsWith("--reference=")) {
			references.push(p.replace("--reference=", ""));
		} else if (i === 1 && !p.startsWith("--")) {
			timeoutMs = Number.parseInt(p, 10) || 0;
		} else if (i === 2 && !p.startsWith("--")) {
			defaultText = p;
		}
	}

	const balloon =
		handler.player?.currentScope === 1
			? handler.app?.elements?.keroBalloonText
			: handler.app?.elements?.balloonText;
	if (!balloon) return;

	const form = document.createElement("div");
	form.className = isPassword
		? "balloon-inputbox-form balloon-passwordinput-form"
		: "balloon-inputbox-form";
	form.style.marginTop = "0.5rem";
	form.style.display = "flex";
	form.style.gap = "4px";

	const input = document.createElement("input");
	input.type = isPassword ? "password" : "text";
	input.value = defaultText;
	input.placeholder = placeholder;
	input.style.flex = "1";
	input.style.padding = "2px 4px";

	const submitBtn = document.createElement("button");
	submitBtn.textContent = "OK";
	submitBtn.style.padding = "2px 8px";

<<<<<<< HEAD
	const _timer: unknown = null;
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	let timer: any = null;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad

	const cancel = (reason: string = "cancel") => {
		if (timer) clearTimeout(timer);
		form.remove();
		handler.app.ghostController?.sendShioriEvent(`${id}Cancel`, [reason]);
		handler.app.ghostController?.sendShioriEvent("OnSystemDialogCancel", [
			id,
			reason,
		]);
	};

	const submit = () => {
		if (timer) clearTimeout(timer);
		const val = input.value;
		form.remove();
		handler.app.ghostController?.sendShioriEvent(id, [val, ...references]);
		handler.app.ghostController?.sendShioriEvent("OnUserInput", [
			id,
			val,
			...references,
		]);
		handler.app.ghostController?.sendShioriEvent("OnSystemDialog", [id, val]);
	};

	submitBtn.addEventListener("click", () => submit());
<<<<<<< HEAD
	input.addEventListener("keydown", (e: unknown) => 
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	input.addEventListener("keydown", (e: any) => 
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		if (e.key === "Enter") {
			submit();
		} else if (e.key === "Escape") {
			cancel("escape");
		});

	form.appendChild(input);
	form.appendChild(submitBtn);
	balloon.appendChild(form);
	setTimeout(() => input.focus?.(), 50);

	if (timeoutMs > 0) {
		timer = setTimeout(() => {
			cancel("timeout");
		}, timeoutMs);
	}

<<<<<<< HEAD
export function _openPasswordInput(handler: unknown, params: string[]) {
	return openInputBox(handler, params, true);
}

export function _openTextAreaBox(_handler: unknown, _params: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _openPasswordInput(handler: any, params: string[]) {
	return openInputBox(handler, params, true);
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _openTextAreaBox(handler: any, params: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (handler.app?.modalDialogController?.openTextAreaBox) {
		return handler.app.modalDialogController.openTextAreaBox(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

<<<<<<< HEAD
export function _openSliderInput(_handler: unknown, _params: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _openSliderInput(handler: any, params: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (handler.app?.modalDialogController?.openSliderInput) {
		return handler.app.modalDialogController.openSliderInput(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

<<<<<<< HEAD
export function _openIpInput(_handler: unknown, _params: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _openIpInput(handler: any, params: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (handler.app?.modalDialogController?.openIpInput) {
		return handler.app.modalDialogController.openIpInput(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

<<<<<<< HEAD
export function _openDateInput(_handler: unknown, _params: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _openDateInput(handler: any, params: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (handler.app?.modalDialogController?.openDateInput) {
		return handler.app.modalDialogController.openDateInput(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

<<<<<<< HEAD
export function _openTimeInput(_handler: unknown, _params: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _openTimeInput(handler: any, params: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (handler.app?.modalDialogController?.openTimeInput) {
		return handler.app.modalDialogController.openTimeInput(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

<<<<<<< HEAD
export function closeInputBox(
	_handler: unknown,
	_paramsOrNotify: unknown = false,
) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _closeInputBox(handler: any, paramsOrNotify: any = false) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	let notifyCancel = false;
	let id: string | undefined;
	if (Array.isArray(paramsOrNotify)) {
		id = paramsOrNotify[0];
	} else {
		notifyCancel = Boolean(paramsOrNotify);
	}
	if (handler.app?.modalDialogController?.closeInputBox) {
		return handler.app.modalDialogController.closeInputBox(
			id,
			handler.player?.currentScope,
			notifyCancel,
		);
	}
	const forms = document.querySelectorAll?.(".balloon-inputbox-form") || [];
	for (const _f of Array.from(forms)) {
<<<<<<< HEAD
		(f as unknown).remove?.();
	}
}

export function _closeTextAreaBox(
	_handler: unknown,
	_paramsOrNotify: unknown = false,
) {
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(f as any).remove?.();
	}
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _closeTextAreaBox(handler: any, paramsOrNotify: any = false) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (handler.app?.modalDialogController?.closeTextAreaBox) {
		const id = Array.isArray(paramsOrNotify) ? paramsOrNotify[0] : undefined;
		return handler.app.modalDialogController.closeTextAreaBox(
			id,
			handler.player?.currentScope,
		);
	}
	closeInputBox(handler, paramsOrNotify);
}

<<<<<<< HEAD
export function _closeDialog(_handler: unknown, _paramsOrNotify: unknown = false) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _closeDialog(handler: any, paramsOrNotify: any = false) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (handler.app?.modalDialogController?.closeDialog) {
		const id = Array.isArray(paramsOrNotify) ? paramsOrNotify[0] : undefined;
		return handler.app.modalDialogController.closeDialog(
			id,
			handler.player?.currentScope,
		);
	}
	closeInputBox(handler, paramsOrNotify);
}
