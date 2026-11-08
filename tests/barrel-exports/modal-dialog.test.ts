import assert from "node:assert/strict";
import { describe, it } from "vitest";
import * as advancedInputsFacade from "../../ui/js/ui/renderers/inputs/advanced-inputs.js";
import * as modalDialogInputsFacade from "../../ui/js/ui/renderers/modal-dialog-inputs.js";

describe("Modal Dialog Barrel and Facade Re-exports Coverage", () => {
	it("ui/js/ui/renderers/modal-dialog-inputs.js re-exports expected symbols", () => {
		assert.equal(typeof modalDialogInputsFacade.attachAutocomplete, "function");
		assert.equal(typeof modalDialogInputsFacade.parseBoxOptions, "function");
		assert.equal(typeof modalDialogInputsFacade.openInputBox, "function");
		assert.equal(typeof modalDialogInputsFacade.openPasswordInput, "function");
		assert.equal(typeof modalDialogInputsFacade.closeInputBox, "function");
		assert.equal(typeof modalDialogInputsFacade.openTextAreaBox, "function");
		assert.equal(typeof modalDialogInputsFacade.closeTextAreaBox, "function");
		assert.equal(typeof modalDialogInputsFacade.openSliderInput, "function");
		assert.equal(typeof modalDialogInputsFacade.openDateInput, "function");
		assert.equal(typeof modalDialogInputsFacade.openTimeInput, "function");
		assert.equal(typeof modalDialogInputsFacade.openIpInput, "function");
	});

	it("ui/js/ui/renderers/inputs/advanced-inputs.js re-exports expected symbols", () => {
		assert.equal(typeof advancedInputsFacade.openSliderInput, "function");
		assert.equal(typeof advancedInputsFacade.openDateInput, "function");
		assert.equal(typeof advancedInputsFacade.openTimeInput, "function");
		assert.equal(typeof advancedInputsFacade.openIpInput, "function");
	});
});
