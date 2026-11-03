/**
 * @file modal-dialog-inputs.js
 * @brief inputbox, passwordinput, textareabox, sliderinput, dateinput, timeinput, ipinput および autocomplete 処理 (再エクスポート)
 */

export {
	openDateInput,
	openIpInput,
	openSliderInput,
	openTimeInput,
} from "./inputs/advanced-inputs.js";
export { attachAutocomplete, parseBoxOptions } from "./inputs/input-helpers.js";
export {
	closeInputBox,
	closeTextAreaBox,
	openInputBox,
	openPasswordInput,
	openTextAreaBox,
} from "./inputs/text-inputs.js";
