# 4. JavaScript 拡張機能（Plugin System）による可変性・拡張性の維持

WASM でコアを強固にしつつ、ユーザーが手軽に機能を拡張・カスタマイズできるよう、**モダンな JavaScript/TypeScript 拡張システム** を導入します。

### 4.1 プラグイン（拡張機能）の構造

プラグインはフォルダ単位で配布され、以下の構成を取ります：

```text
plugins/
└── sample-weather-plugin/
    ├── plugin.json       # メタデータ・権限宣言
    ├── index.js          # エントリーポイント (ES Module)
    └── style.css         # 追加 UI スタイル (任意)
```

#### `plugin.json`（マニフェスト定義）

```json
{
	"id": "nanai-weather-plugin",
	"name": "お天気通知プラグイン",
	"version": "1.0.0",
	"author": "Nanai Project",
	"permissions": ["network:fetch", "shiori:raise_event", "ui:balloon"]
}
```

### 4.2 プラグイン API（Plugin SDK）仕様

拡張機能はグローバルな汚染を防ぎ、安全な `PluginContext` 経由でのみアプリにアクセスします。

```javascript
// index.js の実装例
export default class WeatherPlugin {
	async onInit(context) {
		this.context = context;
		console.log("お天気プラグインがロードされました");

		// 1. 定期イベントのフック
		context.events.on("OnMinuteChange", async () => {
			await this.checkWeather();
		});

		// 2. メニュー項目の追加
		context.menu.registerItem({
			id: "check-weather",
			label: "☀️ 天気予報を聞く",
			action: () => this.speakWeather(),
		});
	}

	async checkWeather() {
		// 天気 API 取得
		const res = await this.context.network.fetch("https://api.weather...");
		const data = await res.json();

		// ゴーストにイベントとして渡す、または直接バルーン表示
		this.context.shiori.raiseEvent("OnWeatherNotice", [
			data.weather,
			data.temp,
		]);
	}

	speakWeather() {
		this.context.ui.showBalloon("今日はいい天気だよ！お出かけ日和だね♪");
	}

	onDestroy() {
		console.log("お天気プラグインが破棄されました");
	}
}
```

### 4.3 提供される拡張ポイント（Hooks & Extensibility）

1. **イベントフック (`context.events`)**:
   - `OnBoot`, `OnSecondChange`, `OnMouseClick`, `OnBalloonClick` 等の標準イベントへの割り込み・追加処理。
2. **UI 拡張 (`context.ui` / `context.menu`)**:
   - モバイル向けリングメニューや PC コンテキストメニューへの独自アクション追加。
   - バルーン内への独自 HTML/CSS 要素（ボタン、グラフ、アニメーション）の埋め込み。
3. **対話拡張 (`context.shiori`)**:
   - 独自の擬似 SHIORI 応答の注入（LLM / 生成 AI API との連携プラグイン等）。

---
