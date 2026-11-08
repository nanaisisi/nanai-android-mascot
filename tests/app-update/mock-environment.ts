import "./mock/dom-stubs.js";
import {
	createPersistentListenersProxy,
	getProgressCb,
	setProgressCb,
} from "./mock/tauri-listeners.js";

const { updateMethods } = await import("../../ui/js/core/app-update.js");

export {
	createPersistentListenersProxy,
	getProgressCb,
	setProgressCb,
	updateMethods,
};
