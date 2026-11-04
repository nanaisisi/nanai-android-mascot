/**
 * モーダル用 HTML テンプレート集 (Facade)
 * 各種テンプレートをドメイン別モジュールから集約してエクスポート
 */
import { docTemplates } from "./templates/doc-templates.js";
import { ghostTemplates } from "./templates/ghost-templates.js";
import { settingsTemplates } from "./templates/settings-templates.js";
import { systemTemplates } from "./templates/system-templates.js";

export const modalTemplates = {
	...ghostTemplates,
	...settingsTemplates,
	...systemTemplates,
	...docTemplates,
};
