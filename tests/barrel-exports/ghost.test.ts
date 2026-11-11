import assert from "node:assert/strict";
import { describe, it } from "vitest";
import * as commandHandlerBarrel from "../../ui/ts/ghost/command-handler/index.js";
import * as commandHandlerSystemFacade from "../../ui/ts/ghost/command-handler/system.js";
import * as sakuraParserFacade from "../../ui/ts/ghost/sakura-parser.js";

describe("Ghost Barrel and Facade Re-exports Coverage", () => {
	it("ui/js/ghost/sakura-parser.js re-exports expected symbols", () => {
		assert.equal(typeof sakuraParserFacade.collectAstTokens, "function");
		assert.equal(
			typeof sakuraParserFacade.collectAstTokensByLifetime,
			"function",
		);
		assert.equal(typeof sakuraParserFacade.getSakuraTokenLifetime, "function");
		assert.equal(typeof sakuraParserFacade.tokensToAst, "function");
		assert.equal(typeof sakuraParserFacade.traverseAst, "function");
		assert.equal(typeof sakuraParserFacade.parseSakuraScriptAsync, "function");
		assert.equal(typeof sakuraParserFacade.rustCommandsToTokens, "function");
		assert.equal(typeof sakuraParserFacade.parseSakuraScript, "function");
	});

	it("ui/js/ghost/command-handler/index.js re-exports expected symbols", () => {
		assert.equal(typeof commandHandlerBarrel.openCommunicateBox, "function");
		assert.equal(typeof commandHandlerBarrel.closeCommunicateBox, "function");
		assert.equal(
			typeof commandHandlerBarrel.initDefaultCommandHandlers,
			"function",
		);
		assert.equal(typeof commandHandlerBarrel.expandSakuraScriptEnv, "function");
		assert.equal(
			typeof commandHandlerBarrel.registerCommandHandler,
			"function",
		);
		assert.equal(typeof commandHandlerBarrel.getCommandHandler, "function");
	});

	it("ui/js/ghost/command-handler/system.js re-exports expected symbols", () => {
		assert.equal(
			typeof commandHandlerSystemFacade.handleExecuteResetBalloonPos,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleExecuteResetWindowPos,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetAlignmentOnDesktop,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetTaskTrayIcon,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetTrayBalloon,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleReloadShiori,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetShioriDebugMode,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetAlphaCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetPositionCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetPropertyCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetScalingCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleBiffCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleExecuteSntpCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleOpenSystemTarget,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.clearAllScriptTimers,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleNotifyCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleTimerRaiseCommand,
			"function",
		);
	});
});
