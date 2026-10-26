/**
 * 設定・プラグイン用 HTML テンプレート
 */
export const settingsTemplates = {
	"settings-modal-content": `
    <h2>⚙️ 設定</h2>
    <div class="form-section">
      <span class="form-label">
        <input type="checkbox" id="auto-load-ghost" checked />
        自動ゴースト読み込み
      </span>
    </div>
    <div class="form-section">
      <span class="form-label">
        <input type="checkbox" id="enable-notifications" checked />
        通知を有効化
      </span>
    </div>
    <div class="form-section">
      <span class="form-label">
        <input type="checkbox" id="dark-mode" />
        ダークモード
      </span>
    </div>
    <div class="form-section">
      <span class="form-label">
        <input type="checkbox" id="always-on-top" checked />
        常に最前面に表示
      </span>
    </div>
    <div class="form-section" id="overlay-permission-section">
      <span class="form-label">Android オーバーレイ設定:</span>
      <button type="button" id="open-overlay-settings-btn" style="font-size: 11px; padding: 4px 8px;">
        📲 重ねて表示の権限設定を開く
      </button>
    </div>
    <div class="form-section">
      <span class="form-label">シェル表示倍率:</span>
      <select id="shell-scale">
        <option value="50">50%</option>
        <option value="75">75%</option>
        <option value="100" selected>100% (標準)</option>
        <option value="125">125%</option>
        <option value="150">150%</option>
        <option value="200">200%</option>
      </select>
    </div>
    <div class="form-section">
      <span class="form-label">バルーン倍率:</span>
      <select id="balloon-scale">
        <option value="80">80%</option>
        <option value="100" selected>100% (標準)</option>
        <option value="120">120%</option>
        <option value="150">150%</option>
      </select>
    </div>
    <div class="form-section">
      <span class="form-label">デバッグレベル:</span>
      <select id="debug-level">
        <option value="error">エラーのみ</option>
        <option value="warn">警告以上</option>
        <option value="info" selected>情報以上</option>
        <option value="debug">デバッグ全て</option>
      </select>
    </div>
    <div class="form-section">
      <button type="button" id="save-settings-btn" class="primary">設定保存</button>
      <button type="button" id="reset-settings-btn">設定リセット</button>
    </div>
  `,

	"plugins-modal-content": `
    <h2>🧩 プラグイン・拡張機能</h2>
    <div class="form-section">
      <span class="form-label">インストール済み拡張機能 (JS/WASM):</span>
      <div class="ghost-list" id="plugin-list">
        <div class="ghost-item active">
          <strong>sample-clock-plugin (内蔵)</strong><br>
          <small>定時トーク・時報通知プラグイン (v1.0.0)</small>
        </div>
        <div class="ghost-item">
          <strong>mock-weather-shim (内蔵)</strong><br>
          <small>お天気取得エミュレーション (v1.0.0)</small>
        </div>
      </div>
    </div>
    <div class="form-section">
      <button type="button" id="add-plugin-btn" class="primary">新しいプラグインを追加...</button>
    </div>
  `,
};
