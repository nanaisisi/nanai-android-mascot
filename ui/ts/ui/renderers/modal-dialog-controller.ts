/**
 * @file modal-dialog-controller.ts
 * @brief さくらスクリプトおよびUIからの各種ダイアログ（inputbox, passwordinput, textareabox, sliderinput, teachbox, communicatebox, 選択肢リスト）を統括管理するコントローラー
 */

import {
	closeAll,
	closeDialog,
	createChoiceButton,
	setChoiceTimeout,
} from "./modal-dialog-choices.js";
import {
	closeCommunicateBox,
	closeTeachBox,
	openCommunicateBox,
	openTeachBox,
} from "./modal-dialog-communication.js";
import {
	attachAutocomplete,
	closeInputBox,
	closeTextAreaBox,
	openDateInput,
	openInputBox,
	openIpInput,
	openPasswordInput,
	openSliderInput,
	openTextAreaBox,
	openTimeInput,
	parseBoxOptions,
} from "./modal-dialog-inputs.js";
import { openSystemDialog } from "./modal-dialog-system.js";

export class ModalDialogController {
	app: unknown;
	player: unknown;
	activeBoxes: Map<string, unknown>;
	choiceTimeoutTimer: ReturnType<typeof setTimeout> | null;
	autocompleteCounter: number;

	declare attachAutocomplete: typeof attachAutocomplete;
	declare parseBoxOptions: typeof parseBoxOptions;
	declare openInputBox: typeof openInputBox;
	declare openPasswordInput: typeof openPasswordInput;
	declare closeInputBox: typeof closeInputBox;
	declare openTextAreaBox: typeof openTextAreaBox;
	declare closeTextAreaBox: typeof closeTextAreaBox;
	declare openSliderInput: typeof openSliderInput;
	declare openDateInput: typeof openDateInput;
	declare openTimeInput: typeof openTimeInput;
	declare openIpInput: typeof openIpInput;
	declare openTeachBox: typeof openTeachBox;
	declare closeTeachBox: typeof closeTeachBox;
	declare openCommunicateBox: typeof openCommunicateBox;
	declare closeCommunicateBox: typeof closeCommunicateBox;
	declare closeDialog: typeof closeDialog;
	declare createChoiceButton: typeof createChoiceButton;
	declare setChoiceTimeout: typeof setChoiceTimeout;
	declare closeAll: typeof closeAll;
	declare openSystemDialog: typeof openSystemDialog;

	/**
	 * @param {object|unknown} options - アプリケーションインスタンス、または { app, player } オブジェクト
	 */
	constructor(options: unknown = {}) {
		const isDirectApp =
			options && typeof options === "object" && "elements" in options;
		this.app = isDirectApp ? options : (options?.app ?? null);
		this.player = options?.player ?? null;
		this.activeBoxes = new Map();
		this.choiceTimeoutTimer = null;
		this.autocompleteCounter = 0;
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
}

ModalDialogController.prototype.attachAutocomplete = attachAutocomplete;
ModalDialogController.prototype.parseBoxOptions = parseBoxOptions;
ModalDialogController.prototype.openInputBox = openInputBox;
ModalDialogController.prototype.openPasswordInput = openPasswordInput;
ModalDialogController.prototype.closeInputBox = closeInputBox;
ModalDialogController.prototype.openTextAreaBox = openTextAreaBox;
ModalDialogController.prototype.closeTextAreaBox = closeTextAreaBox;
ModalDialogController.prototype.openSliderInput = openSliderInput;
ModalDialogController.prototype.openDateInput = openDateInput;
ModalDialogController.prototype.openTimeInput = openTimeInput;
ModalDialogController.prototype.openIpInput = openIpInput;
ModalDialogController.prototype.openSystemDialog = openSystemDialog;

ModalDialogController.prototype.openTeachBox = openTeachBox;
ModalDialogController.prototype.closeTeachBox = closeTeachBox;
ModalDialogController.prototype.openCommunicateBox = openCommunicateBox;
ModalDialogController.prototype.closeCommunicateBox = closeCommunicateBox;

ModalDialogController.prototype.closeDialog = closeDialog;
ModalDialogController.prototype.createChoiceButton = createChoiceButton;
ModalDialogController.prototype.setChoiceTimeout = setChoiceTimeout;
ModalDialogController.prototype.closeAll = closeAll;
