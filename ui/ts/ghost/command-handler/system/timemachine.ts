/**
 * @file timemachine.ts
 * @brief \![timemachine,set,値] / \![timemachine,reset] 仮想時刻制御コマンド
 */

let timemachineOffsetSeconds = 0;
let allowTimemachineControl = false;

export function setAllowTimemachineControl(allowed: boolean): void {
	allowTimemachineControl = Boolean(allowed);
}

export function getTimemachineOffsetSeconds(): number {
	return timemachineOffsetSeconds;
}

export function getVirtualNowMs(baseNowMs: number = Date.now()): number {
	return baseNowMs + timemachineOffsetSeconds * 1000;
}

export function handleTimemachineCommand(
	handler: import("../../sakura-command-handler.js").SakuraCommandHandler,
	args: string[],
): void {
	const settings = handler.app?.settings as
		| { allowTimemachineControl?: boolean }
		| undefined;
	const isAllowed =
		allowTimemachineControl || Boolean(settings?.allowTimemachineControl);
	if (!isAllowed) {
		console.warn(
			"⚠️ [timemachine] allowTimemachineControl が無効のため無視されました。",
		);
		return;
	}

	const subCmd = String(args[1] ?? "")
		.trim()
		.toLowerCase();
	if (subCmd === "reset") {
		timemachineOffsetSeconds = 0;
		return;
	}
	if (subCmd === "set") {
		const rawVal = Number(args[2]);
		if (Number.isFinite(rawVal)) {
			timemachineOffsetSeconds = Math.trunc(rawVal);
		}
	}
}
