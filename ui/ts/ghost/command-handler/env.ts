/**
 * @file env.ts
 * @brief さくらスクリプト環境変数・システムプロパティ展開エンジン (Slot-06)
 * [environmentvariable.md], [notes_environmentvariable.md], [pct-star.md], [pct-m-q.md], [notes_lifespan.md]
 */

import type { SakuraEnvContext } from "../../core/wasm/pkg/nanai_core.js";

export interface SakuraEnvExpandOptions extends Partial<SakuraEnvContext> {
	screenWidth?: number;
	screenHeight?: number;
	randomWords?: string[];
	properties?: Record<string, string>;
	wordMap?: Record<string, string[]>;
	[key: string]: unknown;
}

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

/**
 * スクリプト実行単位の寿命管理（さくらスクリプトの寿命: \e またはスクリプト終了時にリセット）
 */
class ScriptLifetimeState {
	private customVariables: Map<string, string>;
	private activeModes: Set<string>;

	constructor() {
		this.customVariables = new Map();
		this.activeModes = new Set();
	}

	setVariable(name: string | null | undefined, value?: unknown): void {
		if (name === null || name === undefined) return;
		this.customVariables.set(String(name), String(value ?? ""));
	}

	getVariable(name: string | null | undefined): string | undefined {
		if (name === null || name === undefined) return undefined;
		return this.customVariables.get(String(name));
	}

	hasVariable(name: string | null | undefined): boolean {
		if (name === null || name === undefined) return false;
		return this.customVariables.has(String(name));
	}

	deleteVariable(name: string | null | undefined): boolean {
		if (name === null || name === undefined) return false;
		return this.customVariables.delete(String(name));
	}

	getAllVariables(): Record<string, string> {
		return Object.fromEntries(this.customVariables.entries());
	}

	setMode(mode: string | null | undefined, active = true): void {
		if (!mode) return;
		const key = String(mode).toLowerCase();
		if (active) {
			this.activeModes.add(key);
		} else {
			this.activeModes.delete(key);
		}
	}

	hasMode(mode: string | null | undefined): boolean {
		if (!mode) return false;
		return this.activeModes.has(String(mode).toLowerCase());
	}

	getModes(): string[] {
		return Array.from(this.activeModes);
	}

	clearModes(): void {
		this.activeModes.clear();
	}

	reset(): void {
		this.customVariables.clear();
		this.activeModes.clear();
	}
}

export const scriptLifetimeState = new ScriptLifetimeState();

/**
 * さくらスクリプト内の環境変数・プロパティを展開
 */
export function expandSakuraScriptEnv(
	script: string,
	options: SakuraEnvExpandOptions = {},
): string {
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
			options.screen_width ??
			(typeof window !== "undefined" ? window.innerWidth : 1024),
	);
	const screenHeight = String(
		options.screenHeight ??
			options.screen_height ??
			(typeof window !== "undefined" ? window.innerHeight : 768),
	);
	const candidateRandomWords = options.randomWords ?? options.random_words;
	const randomWords =
		candidateRandomWords && candidateRandomWords.length > 0
			? candidateRandomWords
			: DEFAULT_RANDOM_WORDS;

	let result = script;

	// 1. エスケープされた \% を保護
	result = result.replaceAll("\\%", "\uE000");

	// 2. %property[...] の展開
	result = result.replace(
		/%property\[([^\]]+)\]/g,
		(_match, propKey: string) => {
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
				case "system.update.time":
				case "update.lasttime":
				case "history.update.lasttime":
					return "";
				case "sakura.bind.menu":
				case "kero.bind.menu":
				case "sakura.menu":
				case "kero.menu":
					return "auto";
				default:
					if (key.endsWith(".bind.menu") || key.endsWith(".menu"))
						return "auto";
					if (key.startsWith("system.os.")) return "Linux";
					if (key.startsWith("system.cpu.")) return "x86_64";
					if (key.startsWith("system.memory.")) return "1024";
					if (key.startsWith("system.power.")) return "ac";
					if (key.startsWith("system.network.")) return "online";
					if (key.startsWith("system.monitor.index")) return "0,0,1920,1080";
					if (key.startsWith("system.disk.index")) return "100000";
					return scriptLifetimeState.getVariable(key) ?? "";
			}
		},
	);

	// 3. %* の展開 (UKADOC仕様: \![*] マーカーと同じ機能)
	result = result.replaceAll("%*", "\\![*]");

	// 4. %m? の展開 (UKADOC仕様: 単語-非限定。ランダム選択)
	result = result.replace(/%m\?/g, () => {
		const idx = Math.floor(Math.random() * randomWords.length);
		return randomWords[idx];
	});

	const categoryWordsMap: Record<string, string[]> = {
		"%me": options.words_me?.length
			? options.words_me
			: [
					"カレーライス",
					"ケーキ",
					"ポッキー",
					"おでん",
					"りんご",
					"ラーメン",
					"和菓子",
				],
		"%mp": options.words_mp?.length
			? options.words_mp
			: ["秋葉原", "モスクワ", "公園", "海", "新宿", "例の場所"],
		"%mh": options.words_mh?.length
			? options.words_mh
			: ["コンビニ", "八百屋", "喫茶店", "松屋", "東急ハンズ", "本屋"],
		"%mc": options.words_mc?.length
			? options.words_mc
			: ["マイクロソフト", "ソニー", "富士通", "シャープ", "任天堂"],
		"%mt": options.words_mt?.length
			? options.words_mt
			: ["ビンタ", "キン肉バスター", "蹴り", "真空竜巻旋風脚", "言葉責め"],
		"%mz": options.words_mz?.length
			? options.words_mz
			: ["パソコン", "タブレット", "湯呑み", "ディスプレイ", "チョロQ"],
		"%ml": options.words_ml?.length
			? options.words_ml
			: ["仲間", "人類", "仲間たち"],
		"%dms": options.words_dms?.length
			? options.words_dms
			: ["意外と近くにいた宇宙人", "食べられない大根"],
	};

	const pickCategoryWord = (tag: string, fallback: string): string => {
		const custom = options.wordMap?.[tag];
		const pool = custom && custom.length > 0 ? custom : categoryWordsMap[tag];
		if (!pool || pool.length === 0) return fallback;
		return pool[Math.floor(Math.random() * pool.length)];
	};

	// 5. カテゴリ別「単語-」環境変数の動的抽選展開
	result = result.replace(/%me/g, () =>
		pickCategoryWord("%me", "カレーライス"),
	);
	result = result.replace(/%mp/g, () => pickCategoryWord("%mp", "秋葉原"));
	result = result.replace(/%mh/g, () => pickCategoryWord("%mh", "コンビニ"));
	result = result.replace(/%mc/g, () => pickCategoryWord("%mc", "ソニー"));
	result = result.replace(/%mt/g, () => pickCategoryWord("%mt", "ビンタ"));
	result = result.replace(/%mz/g, () => pickCategoryWord("%mz", "パソコン"));
	result = result.replace(/%ml/g, () => pickCategoryWord("%ml", "仲間"));
	result = result.replace(/%dms/g, () =>
		pickCategoryWord("%dms", "意外と近くにいた宇宙人"),
	);

	// 6. 日時・システム環境変数マップの構築
	const envMap: Record<string, string> = {
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
		"%et": "0",
		"%exh": "0",
		"%wronghour": "0",
		"%lastghostname": lastghostname,
		"%lastobjectname": lastobjectname,
		"%ms": selfname,
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

/**
 * さくらスクリプトの寿命 (notes_lifespan.md) に基づき一時変数をリセット
 */
export function resetScriptScopeState(): void {
	scriptLifetimeState.reset();
}
