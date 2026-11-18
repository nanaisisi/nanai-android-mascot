/**
 * 設定・プラグイン用 HTML テンプレート (SSP: 設定 準拠ダイナミックタブ対応)
 */
export const settingsTemplates = {
	"settings-modal-content": `
    <div class="ssp-settings-dialog">
      <div class="ssp-settings-header">
        <h2 style="font-size: 14px; margin: 0; padding: 4px 8px; font-weight: bold; background: #0078d7; color: white;">SSP: 設定</h2>
      </div>

      <!-- 設定タブナビゲーション -->
      <div class="ssp-tab-bar" style="display: flex; flex-wrap: wrap; background: #e1e1e1; border-bottom: 1px solid #ccc; padding: 2px 2px 0 2px; font-size: 11px;">
        <button type="button" class="ssp-tab-btn active" data-tab="general" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #fff; cursor: pointer;">一般</button>
        <button type="button" class="ssp-tab-btn" data-tab="ghost1" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">ゴースト (1)</button>
        <button type="button" class="ssp-tab-btn" data-tab="ghost2" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">ゴースト (2)</button>
        <button type="button" class="ssp-tab-btn" data-tab="folder" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">フォルダ</button>
        <button type="button" class="ssp-tab-btn" data-tab="display" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">表示</button>
        <button type="button" class="ssp-tab-btn" data-tab="talk-balloon" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">喋り/バルーン</button>
        <button type="button" class="ssp-tab-btn" data-tab="savedata" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">セーブデータ</button>
        <button type="button" class="ssp-tab-btn" data-tab="speech" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">音声認識/合成</button>
        <button type="button" class="ssp-tab-btn" data-tab="network1" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">接続(1)</button>
        <button type="button" class="ssp-tab-btn" data-tab="network2" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">接続(2)</button>
        <button type="button" class="ssp-tab-btn" data-tab="mail" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">メール</button>
        <button type="button" class="ssp-tab-btn" data-tab="ext-app" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">外部アプリ</button>
        <button type="button" class="ssp-tab-btn" data-tab="im" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">IM</button>
        <button type="button" class="ssp-tab-btn" data-tab="i18n" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">国際化</button>
        <button type="button" class="ssp-tab-btn" data-tab="stream" style="padding: 3px 8px; margin-right: 2px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">配信</button>
        <button type="button" class="ssp-tab-btn" data-tab="dev" style="padding: 3px 8px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">開発/その他</button>
      </div>

      <!-- 一般タブコンテンツ -->
      <div class="ssp-tab-content" id="ssp-tab-general" style="padding: 12px; font-size: 12px; background: #fff;">
        <fieldset style="border: 1px solid #ccc; padding: 8px; margin-bottom: 8px;">
          <legend style="font-weight: bold; color: #333;">一般: SSP全体の設定</legend>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
            <label><input type="checkbox" id="auto-update-check" checked /> SSPが更新されているか自動でチェックする</label>
            <label><input type="checkbox" id="file-association" checked /> ファイルをSSPに関連づける</label>
            <label><input type="checkbox" id="always-show-uninstall" /> 常にアンインストールメニューを表示</label>
            <label><input type="checkbox" id="always-show-tray-icon" checked /> 常にタスクトレイアイコンを表示</label>
            <label><input type="checkbox" id="show-readme-on-install" checked /> インストール時にREADMEを表示する</label>
            <label><input type="checkbox" id="register-hotkeys" /> ホットキーを登録する</label>
            <label><input type="checkbox" id="show-transparent-status-window" /> 透明ステータス表示ウィンドウを表示する</label>
            <label><input type="checkbox" id="virus-check-enabled" checked /> ウイルスチェックを行う [Win10以降]</label>
            <label><input type="checkbox" id="developer-mode-enabled" /> 開発者用機能を有効にする [使用注意!]</label>
          </div>
        </fieldset>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px;">
          <fieldset style="border: 1px solid #ccc; padding: 6px; font-size: 11px;">
            <legend style="font-weight: bold;">ダークモード [SSPの再起動が必要]</legend>
            <label><input type="radio" name="dark-mode-opt" value="auto" checked /> 自動(OS設定)</label><br>
            <label><input type="radio" name="dark-mode-opt" value="dark" /> 常にダーク</label><br>
            <label><input type="radio" name="dark-mode-opt" value="light" /> 常にライト</label>
          </fieldset>

          <fieldset style="border: 1px solid #ccc; padding: 6px; font-size: 11px;">
            <legend style="font-weight: bold;">センサー/位置情報利用</legend>
            <label><input type="radio" name="location-opt" value="auto" checked /> 有効(OS設定)</label><br>
            <label><input type="radio" name="location-opt" value="except-location" /> 位置情報以外</label><br>
            <label><input type="radio" name="location-opt" value="disabled" /> すべて無効</label>
          </fieldset>

          <fieldset style="border: 1px solid #ccc; padding: 6px; font-size: 11px;">
            <legend style="font-weight: bold;">タブレットモード切替</legend>
            <label><input type="radio" name="tablet-mode-opt" value="auto" checked /> 自動(OS設定)</label><br>
            <label><input type="radio" name="tablet-mode-opt" value="enabled" /> 常に有効</label><br>
            <label><input type="radio" name="tablet-mode-opt" value="disabled" /> 常に無効</label>
          </fieldset>
        </div>

        <fieldset style="border: 1px solid #ccc; padding: 8px; font-size: 11px;">
          <legend style="font-weight: bold;">ユーザ情報</legend>
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 4px;">
            <span>名前: <input type="text" id="user-name" value="ユーザ" style="width: 100px; padding: 2px;" /></span>
            <span>呼ばれ方: <input type="text" id="user-nickname" value="マスター" style="width: 100px; padding: 2px;" /></span>
            <span>誕生日: <input type="date" id="user-birthday" style="padding: 2px;" /></span>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <span>性別:</span>
            <label><input type="radio" name="user-gender" value="male" /> 男</label>
            <label><input type="radio" name="user-gender" value="female" /> 女</label>
            <label><input type="radio" name="user-gender" value="none" checked /> 未設定</label>
          </div>
        </fieldset>
      </div>

      <div class="ssp-settings-footer" style="padding: 8px 12px; background: #f0f0f0; border-top: 1px solid #ccc; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
        <span style="color: #666;">一部の設定を除き、変更はすぐに反映されます。</span>
        <div>
          <button type="button" id="config-help-btn" style="padding: 4px 12px; margin-right: 4px;">ヘルプ(<u>H</u>)</button>
          <button type="button" id="save-settings-btn" class="primary" style="padding: 4px 16px; margin-right: 4px;">OK</button>
          <button type="button" id="close-settings-btn" style="padding: 4px 12px;">閉じる(<u>C</u>)</button>
        </div>
      </div>
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

	"scale-other-modal-content": `
    <h2 id="scale-other-title">倍率設定</h2>
    <div class="form-section">
      <span class="form-label" id="scale-other-label">倍率:</span>
      <p style="font-size: 12px; margin: 4px 0;">Default = 100%</p>
    </div>
    <div class="form-section">
      <label for="scale-x-input">X =</label>
      <input type="number" id="scale-x-input" value="100" min="10" max="1000" style="width: 80px; padding: 4px;" /> %
    </div>
    <div class="form-section">
      <label for="scale-y-input">Y =</label>
      <input type="number" id="scale-y-input" value="100" min="10" max="1000" style="width: 80px; padding: 4px;" /> %
    </div>
    <div class="form-section">
      <label>
        <input type="checkbox" id="scale-xy-lock" checked /> X=Y
      </label>
    </div>
    <div class="form-section" style="text-align: right; margin-top: 16px;">
      <button type="button" id="scale-other-ok-btn" class="primary" style="margin-right: 8px;">OK</button>
      <button type="button" id="scale-other-cancel-btn">キャンセル</button>
    </div>
  `,
};
