import { closeCommunicateBox, openCommunicateBox } from "../communicatebox.js";
import { handleOpenDialogCommand } from "../dialog.js";
import {
	closeDialog,
	closeInputBox,
	closeTextAreaBox,
	openDateInput,
	openInputBox,
	openIpInput,
	openPasswordInput,
	openSliderInput,
	openTextAreaBox,
	openTimeInput,
} from "../inputbox.js";
import { registerCommandHandler } from "../registry.js";
import { closeTeachBox, openTeachBox } from "../teachbox.js";

export function registerDialogCommandHandlers() {
	registerCommandHandler("open:inputbox", async (handler, args) => {
		openInputBox(handler, args.slice(2));
	});

	registerCommandHandler("open:passwordinput", async (handler, args) => {
		openPasswordInput(handler, args.slice(2));
	});

	registerCommandHandler("open:textarea", async (handler, args) => {
		openTextAreaBox(handler, args.slice(2));
	});
	registerCommandHandler("open:textareabox", async (handler, args) => {
		openTextAreaBox(handler, args.slice(2));
	});

	registerCommandHandler("open:slider", async (handler, args) => {
		openSliderInput(handler, args.slice(2));
	});
	registerCommandHandler("open:sliderinput", async (handler, args) => {
		openSliderInput(handler, args.slice(2));
	});

	registerCommandHandler("open:ipinput", async (handler, args) => {
		openIpInput(handler, args.slice(2));
	});

	registerCommandHandler("open:date", async (handler, args) => {
		openDateInput(handler, args.slice(2));
	});
	registerCommandHandler("open:dateinput", async (handler, args) => {
		openDateInput(handler, args.slice(2));
	});

	registerCommandHandler("open:time", async (handler, args) => {
		openTimeInput(handler, args.slice(2));
	});
	registerCommandHandler("open:timeinput", async (handler, args) => {
		openTimeInput(handler, args.slice(2));
	});

	registerCommandHandler("open:teachbox", async (handler, args) => {
		openTeachBox(handler, args.slice(2));
	});

	registerCommandHandler("open:communicatebox", async (handler, args) => {
		openCommunicateBox(handler, args.slice(2));
	});

	registerCommandHandler("close:inputbox", async (handler, args) => {
		closeInputBox(handler, args.slice(2));
	});

	registerCommandHandler("close:textarea", async (handler, args) => {
		closeTextAreaBox(handler, args.slice(2));
	});
	registerCommandHandler("close:textareabox", async (handler, args) => {
		closeTextAreaBox(handler, args.slice(2));
	});

	registerCommandHandler("close:dialog", async (handler, args) => {
		closeDialog(handler, args.slice(2));
	});

	registerCommandHandler("close:teachbox", async (handler, _args) => {
		closeTeachBox(handler);
	});

	registerCommandHandler("close:communicatebox", async (handler, _args) => {
		closeCommunicateBox(handler, true);
	});

	registerCommandHandler("open:dialog", async (handler, args) => {
		await handleOpenDialogCommand(handler, args);
	});
}
