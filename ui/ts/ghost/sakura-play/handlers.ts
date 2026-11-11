/**
 * @file handlers.ts
 * @brief さくらスクリプト再生時のトークンハンドラ・ファサード
 */

import {
	handleAnimation,
	handleSurface,
	handleWaitAnimation,
} from "./handlers/animation.js";
import {
	handleAnchorBegin,
	handleAnchorEnd,
	handleChoice,
	handleChoiceScopeBegin,
	handleChoiceScopeEnd,
} from "./handlers/choice.js";
import {
	handleAutoPause,
	handleBalloonTimeout,
	handleChoiceTimeout,
	handleCommand,
	handleEnd,
	handleHalt,
	handleNoAutoWrap,
	handlePause,
	handleQuickToggle,
	handleRawToggle,
	handleSyncToggle,
	handleTimeout,
	handleWait,
} from "./handlers/control.js";
import {
	handleBalloon,
	handleInlineBitmap,
	handleScope,
} from "./handlers/scope.js";
import {
	handleChar,
	handleClear,
	handleFont,
	handleNewline,
	handleOffset,
} from "./handlers/text.js";

export {
	handleAnchorBegin,
	handleAnchorEnd,
	handleAnimation,
	handleAutoPause,
	handleBalloon,
	handleBalloonTimeout,
	handleChar,
	handleChoice,
	handleChoiceScopeBegin,
	handleChoiceScopeEnd,
	handleChoiceTimeout,
	handleClear,
	handleCommand,
	handleEnd,
	handleFont,
	handleHalt,
	handleInlineBitmap,
	handleNewline,
	handleNoAutoWrap,
	handleOffset,
	handlePause,
	handleQuickToggle,
	handleRawToggle,
	handleScope,
	handleSurface,
	handleSyncToggle,
	handleTimeout,
	handleWait,
	handleWaitAnimation,
};

export async function handleToken(
	player: any,
	app: any,
	token: any,
	context: any,
) {
	switch (token.type) {
		case "scope":
			handleScope(player, app, token, context);
			break;

		case "char":
			await handleChar(player, app, token, context);
			break;

		case "newline":
			handleNewline(player, app, token, context);
			break;

		case "clear":
			handleClear(player, app, token, context);
			break;

		case "pause":
			await handlePause(player, app, token, context);
			break;

		case "anchor_begin":
			handleAnchorBegin(player, app, token, context);
			break;

		case "anchor_end":
			handleAnchorEnd(player, app, token, context);
			break;

		case "quick_toggle":
			handleQuickToggle(player, app, token, context);
			break;

		case "wait":
			await handleWait(player, app, token, context);
			break;

		case "surface":
			handleSurface(player, app, token, context);
			break;

		case "animation":
			await handleAnimation(player, app, token, context);
			break;

		case "wait_animation":
			await handleWaitAnimation(player, app, token, context);
			break;

		case "choice":
			handleChoice(player, app, token, context);
			break;

		case "choice_scope_begin":
			handleChoiceScopeBegin(player, app, token, context);
			break;

		case "choice_scope_end":
			handleChoiceScopeEnd(player, app, token, context);
			break;

		case "no_autowrap":
			handleNoAutoWrap(player, app, token, context);
			break;

		case "raw_toggle":
			handleRawToggle(player, app, token, context);
			break;

		case "auto_pause":
			handleAutoPause(player, app, token, context);
			break;

		case "balloon":
			handleBalloon(player, app, token, context);
			break;

		case "inline_bitmap":
			handleInlineBitmap(player, app, token, context);
			break;

		case "timeout":
			handleTimeout(player, app, token, context);
			break;

		case "choice_timeout":
			handleChoiceTimeout(player, app, token, context);
			break;

		case "balloon_timeout":
			handleBalloonTimeout(player, app, token, context);
			break;

		case "halt":
			await handleHalt(player, app, token, context);
			break;

		case "offset":
			handleOffset(player, app, token, context);
			break;

		case "font":
			handleFont(player, app, token, context);
			break;

		case "sync_toggle":
			handleSyncToggle(player, app, token, context);
			break;

		case "command":
			await handleCommand(player, app, token, context);
			break;

		case "end":
			handleEnd(player, app, token, context);
			break;
	}
}
