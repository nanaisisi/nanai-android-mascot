/**
 * @file SSTP & FMO client actions and types
 * Slot-01: SSTP (1.1/1.2/Direct) and FMO (File Mapping Object) frontend bridges
 * [SSTP/1.x], [req_res], [method_send], [method_execute], [method_give], [method_communicate], [method_notify], [fmo]
 */

import { invoke } from "../tauri-helper.js";

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
}

export interface SstpResponsePayload {
	status: string;
	value: string;
	id?: string;
	reference0?: string;
	additional_data?: string;
	error_description?: string;
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
