/**
 * @file script-log.ts
 * @description SHIORI / さくらスクリプト / エラーログのインメモリリングバッファと購読管理。
 */

export type ScriptLogKind = "shiori" | "sakura" | "error";

export interface ScriptLogEntry {
	id: number;
	timestamp: string;
	kind: ScriptLogKind;
	title: string;
	detail: string;
	ghostName?: string;
}

export type ScriptLogListener = (entries: readonly ScriptLogEntry[]) => void;

const MAX_LOG_ENTRIES = 300;
let nextLogId = 1;
const entries: ScriptLogEntry[] = [];
const listeners = new Set<ScriptLogListener>();

function formatTimestamp(date = new Date()): string {
	const hh = String(date.getHours()).padStart(2, "0");
	const mm = String(date.getMinutes()).padStart(2, "0");
	const ss = String(date.getSeconds()).padStart(2, "0");
	const ms = String(date.getMilliseconds()).padStart(3, "0");
	return `${hh}:${mm}:${ss}.${ms}`;
}

function notifyListeners(): void {
	const snapshot = entries.slice();
	for (const listener of listeners) {
		try {
			listener(snapshot);
		} catch {
			// リスナー側の例外でログ記録を止めない
		}
	}
}

export function recordScriptLog(
	kind: ScriptLogKind,
	title: string,
	detail = "",
	ghostName?: string,
): ScriptLogEntry {
	const entry: ScriptLogEntry = {
		id: nextLogId++,
		timestamp: formatTimestamp(),
		kind,
		title,
		detail,
		...(ghostName ? { ghostName } : {}),
	};
	entries.push(entry);
	if (entries.length > MAX_LOG_ENTRIES) {
		entries.splice(0, entries.length - MAX_LOG_ENTRIES);
	}
	notifyListeners();
	return entry;
}

export function getScriptLogs(
	kind: ScriptLogKind | "all" = "all",
): ScriptLogEntry[] {
	if (kind === "all") {
		return entries.slice();
	}
	return entries.filter((entry) => entry.kind === kind);
}

export function clearScriptLogs(): void {
	entries.length = 0;
	notifyListeners();
}

export function subscribeScriptLogs(listener: ScriptLogListener): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
