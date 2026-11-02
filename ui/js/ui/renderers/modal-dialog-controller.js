/**
 * @file modal-dialog-controller.js
 * @brief さくらスクリプトおよびUIからの各種ダイアログ（inputbox, passwordinput, textareabox, sliderinput, teachbox, communicatebox, 選択肢リスト）を統括管理するコントローラー
 */

import {
	attachAutocomplete,
	parseBoxOptions,
	openInputBox,
	openPasswordInput,
	closeInputBox,
	openTextAreaBox,
	closeTextAreaBox,
	openSliderInput,
	openDateInput,
	openTimeInput,
	openIpInput,
} from "./modal-dialog-inputs.js";
import {
	openTeachBox,
	closeTeachBox,
	openCommunicateBox,
	closeCommunicateBox,
} from "./modal-dialog-communication.js";
import {
	closeDialog,
	createChoiceButton,
	setChoiceTimeout,
	closeAll,
} from "./modal-dialog-choices.js";

export class ModalDialogController {
	/**
	 * @param {object} options
	 * @param {object} options.app アプリケーションインスタンス
	 * @param {object} [options.player] さくらスクリプトプレイヤー
	 */
	constructor({ app, player = null }) {
		this.app = app;
		this.player = player;
		/** @type {Map<string, { id?: string, type?: string, form: HTMLElement, cleanup: (force?: boolean) => void }>} */
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

ModalDialogController.prototype.openTeachBox = openTeachBox;
ModalDialogController.prototype.closeTeachBox = closeTeachBox;
ModalDialogController.prototype.openCommunicateBox = openCommunicateBox;
ModalDialogController.prototype.closeCommunicateBox = closeCommunicateBox;

ModalDialogController.prototype.closeDialog = closeDialog;
ModalDialogController.prototype.createChoiceButton = createChoiceButton;
ModalDialogController.prototype.setChoiceTimeout = setChoiceTimeout;
ModalDialogController.prototype.closeAll = closeAll;
