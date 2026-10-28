/**
 * @file modal-ghost-handlers.js
 * @brief ゴースト・バルーン・導入関連のモーダルハンドラ管理クラス
 */
import { setupExplorerListeners } from "./modal-explorer.js";

export class ModalGhostHandlers {
	/**
	 * @param {import('./modal.js').ModalManager} manager
	 */
	constructor(manager) {
		this.manager = manager;
		this.app = manager.app;
	}

	setupExplorerListeners() {
		setupExplorerListeners(this.manager, this.app);
	}
}
