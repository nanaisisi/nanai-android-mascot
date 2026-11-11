/**
 * @file modal-dialog-controller.js
 * @brief さくらスクリプトおよびUIからの各種ダイアログ（inputbox, passwordinput, textareabox, sliderinput, teachbox, communicatebox, 選択肢リスト）を統括管理するコントローラー
 */

import { app } from "@tauri-apps/api";
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
	player: null;
	activeBoxes: Map<unknown, unknown>;
	choiceTimeoutTimer: null;
	autocompleteCounter: number;
	attachAutocomplete!: (inputEl: unknown, boxType: unknown, id?: string, parentForm?: null) => Promise<HTMLDataListElement | null>;
	parseBoxOptions!: (params: unknown) => { id: unknown; timeoutMs: number; defaultText: string; placeholder: string; limit: number; noClose: boolean; noClear: boolean; references: string[]; };
	openInputBox!: (params: unknown, scope: unknown, isPassword?: boolean) => HTMLDivElement | null;
	openPasswordInput!: (params: unknown, scope: unknown) => unknown;
	closeInputBox!: (id: unknown) => void;
	openTextAreaBox!: (params: unknown, scope: unknown) => HTMLDivElement | null;
	closeTextAreaBox!: (id: unknown) => void;
	openSliderInput!: (params: unknown, scope: unknown) => HTMLDivElement | null;
	openDateInput!: (params: unknown, scope: unknown) => HTMLDivElement | null;
	openTimeInput!: (params: unknown, scope: unknown) => HTMLDivElement | null;
	openIpInput!: (params: unknown, scope: unknown) => HTMLDivElement | null;
	openTeachBox!: (params?: never[], options?: {}) => HTMLDivElement | null;
	closeTeachBox!: (notifyCancel?: boolean) => void;
	openCommunicateBox!: (params: never[] | undefined, scope: unknown) => HTMLDivElement | null;
	closeCommunicateBox!: (notifyCancel?: boolean) => void;
	closeDialog!: (id: unknown, notifyCancel?: boolean) => void;
	createChoiceButton: (({ id, text, onSelect }: { id: unknown; text: unknown; onSelect: unknown; }) => HTMLButtonElement) | undefined;
	setChoiceTimeout: ((timeoutMs: unknown, onTimeout: unknown) => void) | undefined;
	closeAll!: () => void;
	openSystemDialog(dialogType: string, dialogParams: string[], currentScope: number) {
		throw new Error("Method not implemented.");
	}
	/**
	 * @param {object} options
	 * @param {object} options.app アプリケーションインスタンス
	 * @param {object} [options.player] さくらスクリプトプレイヤー
	 */
	constructor({ app: unknown, player = null }) {
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
ModalDialogController.prototype.openSystemDialog = openSystemDialog;

ModalDialogController.prototype.openTeachBox = openTeachBox;
ModalDialogController.prototype.closeTeachBox = closeTeachBox;
ModalDialogController.prototype.openCommunicateBox = openCommunicateBox;
ModalDialogController.prototype.closeCommunicateBox = closeCommunicateBox;

ModalDialogController.prototype.closeDialog = closeDialog;
ModalDialogController.prototype.createChoiceButton = createChoiceButton;
ModalDialogController.prototype.setChoiceTimeout = setChoiceTimeout;
ModalDialogController.prototype.closeAll = closeAll;
