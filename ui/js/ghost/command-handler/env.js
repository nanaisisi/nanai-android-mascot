/**
 * @file env.js
 * @brief さくらスクリプト環境変数・システムプロパティ展開エンジン (Slot-06)
 * [environmentvariable.md], [notes_environmentvariable.md], [pct-star.md], [pct-m-q.md], [notes_lifespan.md]
 */

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
	constructor() {
		this.customVariables = new Map();
	}

	setVariable(name, value) {
		this.customVariables.set(name, String(value));
	}

	getVariable(name) {
		return this.customVariables.get(name);
	}

	reset() {
		this.customVariables.clear();
	}
}

export const scriptLifetimeState = new ScriptLifetimeState();

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
			default:
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

/**
 * さくらスクリプトの寿命 (notes_lifespan.md) に基づき一時変数をリセット
 */
export function resetScriptScopeState() {
	scriptLifetimeState.reset();
}
