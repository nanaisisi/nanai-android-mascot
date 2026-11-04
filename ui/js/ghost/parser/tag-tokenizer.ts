/**
 * @file tag-tokenizer.ts
 * @brief さくらスクリプト（SakuraScript）タグ個別解析・トークナイザー（ファサード）
 */

import { tokenizeDisplayTag } from "./tag/display.js";
import { tokenizeEscapeTag } from "./tag/escape.js";
import { tokenizeInteractiveTag } from "./tag/interactive.js";
import { tokenizeScopeSurfaceTag } from "./tag/scope-surface.js";
import { skipUnknownTag } from "./tag/skip.js";
import { tokenizeTextFormatTag } from "./tag/text-format.js";
import { tokenizeWaitTag } from "./tag/wait.js";

export {
	skipUnknownTag,
	tokenizeDisplayTag,
	tokenizeEscapeTag,
	tokenizeInteractiveTag,
	tokenizeScopeSurfaceTag,
	tokenizeTextFormatTag,
	tokenizeWaitTag,
};

export function tokenizeTag(script: string, backslashIdx: number, len: number) {
	const i = backslashIdx + 1;
	if (i >= len) {
		return { tokens: [], nextIdx: len };
	}

	const escapeRes = tokenizeEscapeTag(script, i, len);
	if (escapeRes) {
		return escapeRes;
	}

	const scopeSurfaceRes = tokenizeScopeSurfaceTag(script, i, len);
	if (scopeSurfaceRes) {
		return scopeSurfaceRes;
	}

	const waitRes = tokenizeWaitTag(script, i, len);
	if (waitRes) {
		return waitRes;
	}

	const textFormatRes = tokenizeTextFormatTag(script, i, len);
	if (textFormatRes) {
		return textFormatRes;
	}

	const interactiveRes = tokenizeInteractiveTag(script, i, len);
	if (interactiveRes) {
		return interactiveRes;
	}

	const displayRes = tokenizeDisplayTag(script, i, len);
	if (displayRes) {
		return displayRes;
	}

	return skipUnknownTag(script, i, len);
}
