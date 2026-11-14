/**
 * @file SSTP & FMO client actions and types
 * Slot-01: SSTP (1.1/1.2/Direct) and FMO (File Mapping Object) frontend bridges
 * [SSTP/1.x], [req_res], [method_send], [method_execute], [method_give], [method_communicate], [method_notify], [fmo]
 */

import { invoke } from "../tauri-helper.js";
import { wasmBridge } from "../wasm-bridge.js";

export interface SstpRequestPayload {
	method?: string;
	sender: string;
	script?: string;
	event?: string;
	hwnd?: number;
	security_level?: string;
	security_origin?: string;
	id?: string;
	options?: string[];
	references?: Record<string, string>;
	connection?: string;
	keep_alive?: boolean;
	surface?: string;
	document?: string;
	song?: string;
	command?: string;
	module?: string;
	is_direct?: boolean;
	sentence?: string;
	receiver_ghost_name?: string;
	receiver_ghost_hwnd?: number;
	content_type?: string;
	user_agent?: string;
	host?: string;
}

export interface SstpResponsePayload {
	status: string;
	value: string;
	id?: string;
	reference0?: string;
	additional_data?: string;
	error_description?: string;
	references?: Record<string, string>;
	content_type?: string;
}

export interface SstpBreakEventPayload {
	script: string;
	scope: number;
	break_position: number;
}

export interface SstpBlacklistingEventPayload {
	client_ip: string;
}

export interface FmoGhostStatus {
	name: string;
	keroname?: string;
	surface0: number;
	surface1: number;
	balloon0: string;
	balloon1: string;
	kerohwnd?: number;
	modulestate?: string;
	path: string;
	is_visible: boolean;
	lifecycle_state: string;
}

export interface FmoSystemStatus {
	ghosts: Record<string, FmoGhostStatus>;
	hwnd: number;
	craftman: string;
}

/**
 * Send structured SSTP request to backend
 * [SSTP/1.1], [method_send], [method_execute]
 */
export async function sendSstpRequest(
	request: SstpRequestPayload,
): Promise<SstpResponsePayload> {
	return invoke<SstpResponsePayload>("send_sstp_request", { request });
}

/**
 * Parse and send raw SSTP protocol string
 * [req_res], [direct]
 */
export async function sendRawSstp(
	rawRequest: string,
): Promise<SstpResponsePayload> {
	return invoke<SstpResponsePayload>("parse_and_send_sstp_raw", {
		raw_request: rawRequest,
	});
}

/**
 * Notify SSTP script break (UKADOC OnSSTPBreak)
 */
export async function notifySstpBreak(
	event: SstpBreakEventPayload,
): Promise<Record<string, string>> {
	return invoke<Record<string, string>>("notify_sstp_break", { event });
}

/**
 * Notify client IP blacklisting (UKADOC OnSSTPBlacklisting)
 */
export async function notifySstpBlacklisting(
	event: SstpBlacklistingEventPayload,
): Promise<Record<string, string>> {
	return invoke<Record<string, string>>("notify_sstp_blacklisting", { event });
}

/**
 * Get current FMO status (UKADOC FMO 1.0)
 */
export async function getFmoStatus(): Promise<FmoSystemStatus> {
	const raw = await invoke<string>("get_fmo_status");
	try {
		return JSON.parse(raw);
	} catch {
		return {
			ghosts: {},
			hwnd: 0,
			craftman: "",
		};
	}
}

/**
 * Update balloon display text in FMO
 * [balloon-fmo], [fmo.balloon0], [fmo.balloon1]
 */
export async function updateFmoBalloonText(
	balloon0: string,
	balloon1: string,
): Promise<FmoSystemStatus> {
	const raw = await invoke<string>("update_fmo_balloon_text", {
		balloon0,
		balloon1,
	});
	try {
		return JSON.parse(raw);
	} catch {
		return {
			ghosts: {},
			hwnd: 0,
			craftman: "",
		};
	}
}

/**
 * Update surface indices in FMO
 * [fmo-status]
 */
export async function updateFmoSurfaces(
	surface0: number,
	surface1: number,
): Promise<FmoSystemStatus> {
	const raw = await invoke<string>("update_fmo_surfaces", {
		surface0,
		surface1,
	});
	try {
		return JSON.parse(raw);
	} catch {
		return {
			ghosts: {},
			hwnd: 0,
			craftman: "",
		};
	}
}

/**
 * Update mobile lifecycle state in FMO
 * [fmo-lifecycle]
 */
export async function updateFmoLifecycleState(
	lifecycleState: string,
	isVisible: boolean,
): Promise<FmoSystemStatus> {
	const raw = await invoke<string>("update_fmo_lifecycle_state", {
		lifecycle_state: lifecycleState,
		is_visible: isVisible,
	});
	try {
		return JSON.parse(raw);
	} catch {
		return {
			ghosts: {},
			hwnd: 0,
			craftman: "",
		};
	}
}

/**
 * Check if base-ware named mutexes exist (ssp, sakura)
 * [mutex.md], [fmo-mutex.md]
 */
export async function checkBaseWareMutex(): Promise<Record<string, boolean>> {
	return invoke<Record<string, boolean>>("check_base_ware_mutex");
}

/**
 * Build raw SSTP 1.x request text from structured payload
 * [SSTP/1.x], [req_res]
 */
export function buildRawSstpRequest(payload: SstpRequestPayload): string {
	const method = (payload.method ?? "SEND").toUpperCase();
	const version = payload.is_direct ? "SAORI/1.0" : "SSTP/1.4";
	const lines: string[] = [`${method} ${version}`];

	lines.push("Charset: UTF-8");
	lines.push(`Sender: ${payload.sender || "Unknown"}`);

	if (payload.script) {
		lines.push(`Script: ${payload.script}`);
	}
	if (payload.event) {
		lines.push(`Event: ${payload.event}`);
	}
	if (payload.sentence) {
		lines.push(`Sentence: ${payload.sentence}`);
	}
	if (payload.command) {
		lines.push(`Command: ${payload.command}`);
	}
	if (payload.receiver_ghost_name) {
		lines.push(`ReceiverGhostName: ${payload.receiver_ghost_name}`);
	}
	if (payload.receiver_ghost_hwnd != null) {
		lines.push(`ReceiverGhostHWnd: ${payload.receiver_ghost_hwnd}`);
	}
	if (payload.hwnd != null) {
		lines.push(`HWnd: ${payload.hwnd}`);
	}
	if (payload.id) {
		lines.push(`ID: ${payload.id}`);
	}
	if (payload.options && payload.options.length > 0) {
		lines.push(`Option: ${payload.options.join(", ")}`);
	}
	if (payload.connection) {
		lines.push(`Connection: ${payload.connection}`);
	}
	if (payload.surface) {
		lines.push(`Surface: ${payload.surface}`);
	}
	if (payload.document) {
		lines.push(`Document: ${payload.document}`);
	}
	if (payload.song) {
		lines.push(`Song: ${payload.song}`);
	}
	if (payload.module) {
		lines.push(`Module: ${payload.module}`);
	}
	if (payload.content_type) {
		lines.push(`Content-Type: ${payload.content_type}`);
	}
	if (payload.user_agent) {
		lines.push(`User-Agent: ${payload.user_agent}`);
	}
	if (payload.host) {
		lines.push(`Host: ${payload.host}`);
	}

	if (payload.references) {
		const sortedKeys = Object.keys(payload.references).sort();
		for (const key of sortedKeys) {
			lines.push(`${key}: ${payload.references[key]}`);
		}
	}

	lines.push("\r\n");
	return lines.join("\r\n");
}

/**
 * Parse raw SSTP response text into structured payload
 * [req_res], [keepalive]
 */
export function parseRawSstpResponse(raw: string): SstpResponsePayload {
	const trimmed = raw.trim();
	if (!trimmed) {
		return {
			status: "400 Bad Request",
			value: "",
			error_description: "Empty response",
		};
	}

	const lines = raw.split(/\r?\n/);
	const statusLine = lines[0]?.trim() ?? "";
	const parts = statusLine.split(/\s+/);
	const statusCode = parts[1] ?? "200";
	const reasonPhrase = parts.slice(2).join(" ") || "OK";
	const status = `${statusCode} ${reasonPhrase}`.trim();

	let script: string | undefined;
	let error_description: string | undefined;
	let reference0: string | undefined;
	let content_type: string | undefined;
	let id: string | undefined;
	const references: Record<string, string> = {};
	let readingHeaders = true;
	const bodyLines: string[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (readingHeaders) {
			if (!line || line.trim() === "") {
				readingHeaders = false;
				continue;
			}
			const colonIdx = line.indexOf(":");
			if (colonIdx !== -1) {
				const key = line.slice(0, colonIdx).trim().toLowerCase();
				const val = line.slice(colonIdx + 1).trim();

				if (key === "script") {
					script = val;
				} else if (key === "errordescription") {
					error_description = val;
				} else if (key === "reference0") {
					reference0 = val;
					references.Reference0 = val;
				} else if (key.startsWith("reference") || key.startsWith("argument")) {
					const normKey = key.startsWith("argument")
						? `Reference${key.slice(8)}`
						: `Reference${key.slice(9)}`;
					references[normKey] = val;
				} else if (key === "content-type") {
					content_type = val;
				} else if (key === "id") {
					id = val;
				}
			}
		} else {
			bodyLines.push(line);
		}
	}

	const additional_data =
		bodyLines.length > 0 ? bodyLines.join("\r\n").trim() : undefined;
	const value = script ?? additional_data ?? "";

	return {
		status,
		value,
		id,
		reference0,
		additional_data,
		error_description,
		references: Object.keys(references).length > 0 ? references : undefined,
		content_type,
	};
}

/**
 * Filter active ghosts from FMO status (excludes stopped/paused)
 */
export function filterActiveGhosts(
	status: FmoSystemStatus,
): Record<string, FmoGhostStatus> {
	const result: Record<string, FmoGhostStatus> = {};
	for (const [id, ghost] of Object.entries(status.ghosts)) {
		if (
			ghost.lifecycle_state !== "stopped" &&
			ghost.lifecycle_state !== "paused"
		) {
			result[id] = ghost;
		}
	}
	return result;
}

/**
 * Filter visible ghosts from FMO status
 */
export function filterVisibleGhosts(
	status: FmoSystemStatus,
): Record<string, FmoGhostStatus> {
	const result: Record<string, FmoGhostStatus> = {};
	for (const [id, ghost] of Object.entries(status.ghosts)) {
		if (ghost.is_visible) {
			result[id] = ghost;
		}
	}
	return result;
}

/**
 * Parse raw SSTP request string locally using WASM core if available
 */
export function parseRawSstpRequestLocal(rawSstp: string): unknown | null {
	if (wasmBridge.isReady()) {
		try {
			return wasmBridge.parseSstpRequest(rawSstp);
		} catch {
			// fallback
		}
	}
	return null;
}
