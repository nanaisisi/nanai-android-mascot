// @ts-nocheck
/**
 * @file env.js
 * @brief さくらスクリプト環境変数・システムプロパティ展開エンジン (Slot-06)
 * [environmentvariable.md], [notes_environmentvariable.md], [pct-star.md], [pct-m-q.md], [notes_lifespan.md]
 */

// @ts-nocheck
/**
 * デフォルトのランダム単語リスト (%m? 用)
 */
const DEFAULT_RANDOM_WORDS = [
	"なない",
	"さくら",
	"うにゅう",
	"まゆら",
	"せりこ",
];

// @ts-nocheck
/**
 * スクリプト実行単位の寿命管理（さくらスクリプトの寿命: \e またはスクリプト終了時にリセット）
 */
class ScriptLifetimeState {
	constructor() {
		this.customVariables = new Map();
		this.activeModes = new Set();
	}

	setVariable(name, value) {
		if (name === null || name === undefined) return;
		this.customVariables.set(String(name), String(value ?? ""));
	}

	getVariable(name) {
		if (name === null || name === undefined) return undefined;
		return this.customVariables.get(String(name));
	}

	hasVariable(name) {
		if (name === null || name === undefined) return false;
		return this.customVariables.has(String(name));
	}

	deleteVariable(name) {
		if (name === null || name === undefined) return false;
		return this.customVariables.delete(String(name));
	}

	getAllVariables() {
		return Object.fromEntries(this.customVariables.entries());
	}

	setMode(mode, active = true) {
		if (!mode) return;
		const key = String(mode).toLowerCase();
		if (active) {
			this.activeModes.add(key);
		} else {
			this.activeModes.delete(key);
		}
	}

	hasMode(mode) {
		if (!mode) return false;
		return this.activeModes.has(String(mode).toLowerCase());
	}

	getModes() {
		return Array.from(this.activeModes);
	}

	clearModes() {
		this.activeModes.clear();
	}

	reset() {
		this.customVariables.clear();
		this.activeModes.clear();
	}
}

export const scriptLifetimeState = new ScriptLifetimeState();

// @ts-nocheck
/**
 * さくらスクリプト内の環境変数・プロパティを展開
 *
 * @param {string} script - 対象のさくらスクリプト文字列
 * @param {object} [options] - 展開オプションおよびコンテキスト
 * @param {string} [options.username] - ユーザー名 (%username)
 * @param {string} [options.selfname] - メインキャラ名 (%selfname, %selfname2, %ms)
 * @param {string} [options.keroname] - サブキャラ名 (%keroname)
 * @param {string} [options.lastghostname] - 直前に起動していたゴースト名 (%lastghostname)
 * @param {string} [options.lastobjectname] - 直前に選択/操作したオブジェクト名 (%lastobjectname)
 * @param {number} [options.screenWidth] - 画面幅 (%screenwidth)
 * @param {number} [options.screenHeight] - 画面高 (%screenheight)
 * @param {string[]} [options.randomWords] - %m? 置換用単語リスト
 * @param {Record<string, string>} [options.properties] - %property[...] 解決用マップ
 * @returns {string} 展開後のスクリプト
 */
export function expandSakuraScriptEnv(script, options = {}) {
	if (!script || typeof script !== "string") {
		return "";
	}

	const now = new Date();
	const username = options.username ?? "User";
	const selfname = options.selfname ?? "Nanai";
	const keroname = options.keroname ?? "Kero";
	const lastghostname = options.lastghostname ?? "";
	const lastobjectname = options.lastobjectname ?? "";
	const screenWidth = String(
		options.screenWidth ??
			(typeof window !== "undefined" ? window.innerWidth : 1024),
	);
	const screenHeight = String(
		options.screenHeight ??
			(typeof window !== "undefined" ? window.innerHeight : 768),
	);
	const randomWords =
		options.randomWords && options.randomWords.length > 0
			? options.randomWords
			: DEFAULT_RANDOM_WORDS;

	let result = script;

	// 1. エスケープされた \% を保護
	result = result.replaceAll("\\%", "\uE000");

	// 2. %property[...] の展開
	result = result.replace(/%property\[([^\]]+)\]/g, (_match, propKey) => {
		const key = propKey.trim();
		if (options.properties && key in options.properties) {
			return options.properties[key];
		}
		switch (key) {
			case "username":
				return username;
			case "currentghost.name":
			case "name":
				return selfname;
			case "keroname":
				return keroname;
			case "lastghostname":
				return lastghostname;
			case "lastobjectname":
				return lastobjectname;
			case "system.year":
				return String(now.getFullYear());
			case "system.month":
				return String(now.getMonth() + 1);
			case "system.day":
				return String(now.getDate());
			case "system.hour":
				return String(now.getHours());
			case "system.minute":
				return String(now.getMinutes());
			case "system.second":
				return String(now.getSeconds());
			case "system.millisecond":
				return String(now.getMilliseconds());
			case "system.dayofweek":
				return String(now.getDay());
			case "system.cursor.pos":
				return "0,0";
			case "system.theme.app.mode":
			case "system.theme.os.mode":
				return "dark";
			case "system.dnd.mode":
				return "none";
			case "system.monitor.count":
			case "system.disk.count":
				return "1";
			case "update_time":
				return "0";
			case "sakura.bind.menu":
			case "kero.bind.menu":
				return "";
			default:
				if (key.startsWith("system.os.")) return "Linux";
				if (key.startsWith("system.cpu.")) return "x86_64";
				if (key.startsWith("system.memory.")) return "1024";
				if (key.startsWith("system.power.")) return "ac";
				if (key.startsWith("system.network.")) return "online";
				if (key.startsWith("system.monitor.index")) return "0,0,1920,1080";
				if (key.startsWith("system.disk.index")) return "100000";
				return scriptLifetimeState.getVariable(key) ?? "";
		}
	});

	// 3. %* の展開 (UKADOC仕様: \![*] マーカーと同じ機能)
	result = result.replaceAll("%*", "\\![*]");

	// 4. %m? の展開 (UKADOC仕様: 単語-非限定。ランダム選択)
	result = result.replace(/%m\?/g, () => {
		const idx = Math.floor(Math.random() * randomWords.length);
		return randomWords[idx];
	});

	// 5. 日時・システム環境変数マップの構築
	const envMap = {
		"%username": username,
		"%selfname2": selfname,
		"%selfname": selfname,
		"%keroname": keroname,
		"%screenwidth": screenWidth,
		"%screenheight": screenHeight,
		"%year": String(now.getFullYear()),
		"%month": String(now.getMonth() + 1),
		"%day": String(now.getDate()),
		"%hour": String(now.getHours()),
		"%minute": String(now.getMinutes()).padStart(2, "0"),
		"%second": String(now.getSeconds()).padStart(2, "0"),
		"%dms": "0",
		"%et": "0",
		"%exh": "0",
		"%wronghour": "0",
		"%lastghostname": lastghostname,
		"%lastobjectname": lastobjectname,
		"%ms": selfname,
		"%mp": "0",
		"%mh": "0",
		"%me": "0",
		"%mt": "0",
		"%mc": "0",
		"%ml": "0",
		"%mz": "0",
	};

	// 6. 単一パス正規表現による既定環境変数の一括置換（最長一致プレフィックス順）
	result = result.replace(
		/%(lastobjectname|lastghostname|screenheight|screenwidth|wronghour|selfname2|selfname|username|keroname|minute|second|month|year|hour|dms|exh|et|ms|mp|mh|me|mt|mc|ml|mz|day)/g,
		(matched) => envMap[matched] ?? matched,
	);

	// 7. 保護していたエスケープ \% をリテラル % に復元
	result = result.replaceAll("\uE000", "%");

	return result;
}

// @ts-nocheck
/**
 * さくらスクリプトの寿命 (notes_lifespan.md) に基づき一時変数をリセット
 */
export function resetScriptScopeState() {
	scriptLifetimeState.reset();
}
