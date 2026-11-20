/**
 * 設定・プラグイン用 HTML テンプレート (NAM: 設定 準拠ダイナミックタブ対応)
 */
export const settingsTemplates = {
	"settings-modal-content": `
    <div class="ssp-settings-dialog">
      <div class="ssp-settings-header">
        <h2 style="font-size: 14px; margin: 0; padding: 4px 8px; font-weight: bold; background: #0078d7; color: white;">NAM: 設定</h2>
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
        <button type="button" class="ssp-tab-btn" id="ssp-tab-btn-dev" data-tab="dev" style="display: none; padding: 3px 8px; border: 1px solid #ccc; border-bottom: none; background: #eee; cursor: pointer;">開発/その他</button>
      </div>

      <!-- 一般タブコンテンツ -->
      <div class="ssp-tab-content" id="ssp-tab-general" style="padding: 12px; font-size: 12px; background: #fff;">
        <fieldset style="border: 1px solid #ccc; padding: 8px; margin-bottom: 8px;">
          <legend style="font-weight: bold; color: #333;">一般: NAM全体の設定</legend>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
            <label><input type="checkbox" id="auto-update-check" checked /> NAMが更新されているか自動でチェックする</label>
            <label><input type="checkbox" id="file-association" checked /> ファイルをNAMに関連づける</label>
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
            <legend style="font-weight: bold;">ダークモード [NAMの再起動が必要]</legend>
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

      <!-- 開発/その他タブコンテンツ (SSP本物互換) -->
      <div class="ssp-tab-content" id="ssp-tab-dev" style="display: none; padding: 12px; font-size: 11px; background: #fff; max-height: 420px; overflow-y: auto;">
        <div style="font-weight: bold; margin-bottom: 6px; color: #333;">開発/その他: 開発用やその他細かい設定</div>

        <!-- FMO / ドロップ / 更新属性 -->
        <fieldset style="border: 1px solid #ccc; padding: 6px; margin-bottom: 6px;">
          <legend style="font-weight: bold;">FMO・ファイル更新操作</legend>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <label><input type="checkbox" id="change-fmo-name" /> FMO名を変更する</label>
            <span>名前: <input type="text" id="fmo-name-input" value="Sakura" style="width: 90px; padding: 2px;" /></span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <label><input type="checkbox" id="drop-make-nar" /> フォルダをドロップした際に更新ファイルやNARを作成</label>
            <label><input type="checkbox" id="keep-old-update-files" /> ネットワーク更新時に旧ファイルを残す</label>
            <label><input type="checkbox" id="ignore-readonly-files" checked /> 読み取り専用属性ファイルは更新対象にしない</label>
            <label><input type="checkbox" id="hide-missing-surface" /> サーフィスが存在しない時に非表示とする</label>
          </div>
        </fieldset>

        <!-- 互換性・システム制御 -->
        <fieldset style="border: 1px solid #ccc; padding: 6px; margin-bottom: 6px;">
          <legend style="font-weight: bold;">互換性・起動ロック</legend>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <label><input type="checkbox" id="fake-materia-mutex" /> Materiaが起動しているように見せかける ("sakura" Mutex)</label>
            <label><input type="checkbox" id="suppress-vanish" /> Vanish (アンインストール)実行を抑制</label>
            <label><input type="checkbox" id="unlock-multiple-instance" style="accent-color: #d32f2f;" /> 複数起動ロックを解除(危険)</label>
            <label><input type="checkbox" id="use-vcs-for-update" /> 利用可能な場合は更新にバージョン管理ツールを使う</label>
          </div>
        </fieldset>

        <!-- エラー・デバッグ通知 -->
        <fieldset style="border: 1px solid #ccc; padding: 6px; margin-bottom: 6px;">
          <legend style="font-weight: bold;">エラー・例外処理</legend>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <label><input type="checkbox" id="notify-warning-error" checked /> Warning レベル以上のエラー発生を通知</label>
            <label><input type="checkbox" id="use-exception-handler" checked /> 例外ハンドラを使う</label>
            <label><input type="checkbox" id="include-beta-on-autoupdate" /> 自動更新の際にテスト版も対象にする</label>
          </div>
        </fieldset>

        <!-- 更新定義ファイル -->
        <fieldset style="border: 1px solid #ccc; padding: 6px; margin-bottom: 6px;">
          <legend style="font-weight: bold;">更新定義ファイル</legend>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <label><input type="checkbox" id="make-updates2-dau" checked /> updates2.dauを作成</label>
            <label><input type="checkbox" id="make-updates-txt" checked /> updates.txtを作成</label>
            <label><input type="checkbox" id="always-utf8-charset" /> 常にUTF-8文字コードを使用する(互換性に問題あり)</label>
            <label><input type="checkbox" id="cache-hash-calculation" checked /> ファイルのハッシュ値計算処理キャッシュ</label>
          </div>
        </fieldset>

        <!-- NAR作成位置 -->
        <fieldset style="border: 1px solid #ccc; padding: 6px;">
          <legend style="font-weight: bold;">NAR作成位置</legend>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <label><input type="radio" name="nar-location-opt" value="ask" checked /> 毎回指定</label>
            <label><input type="radio" name="nar-location-opt" value="same" /> フォルダと同じ</label>
            <div style="display: flex; align-items: center; gap: 4px;">
              <label><input type="radio" name="nar-location-opt" value="custom" /> 指定したフォルダ</label>
              <input type="text" id="nar-custom-dir-path" placeholder="C:\\path\\to\\dir" style="flex: 1; padding: 2px;" />
              <button type="button" id="browse-nar-dir-btn" style="padding: 2px 8px;">参照...</button>
            </div>
          </div>
        </fieldset>
      </div>

      <!-- 国際化タブコンテンツ (SSP本物互換) -->
      <div class="ssp-tab-content" id="ssp-tab-i18n" style="display: none; padding: 12px; font-size: 11px; background: #fff; max-height: 420px; overflow-y: auto;">
        <div style="font-weight: bold; margin-bottom: 6px; color: #333;">国際化: 言語・省略時の文字コード設定 (SSP 準拠)</div>

        <fieldset style="border: 1px solid #ccc; padding: 6px; margin-bottom: 6px;">
          <legend style="font-weight: bold;">省略時の文字コード (readme / descript.txt 未指定時)</legend>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label><input type="checkbox" id="always-utf8-charset-i18n" /> 常にUTF-8文字コードを使用する (OSの標準設定を上書き)</label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>省略時の文字コード (readme/descript):</span>
              <select id="default-readme-charset-select" style="padding: 2px 4px; font-size: 11px;">
                <option value="auto" selected>OSの標準設定 (システムロケール)</option>
                <option value="Shift_JIS">Shift_JIS (CP932)</option>
                <option value="UTF-8">UTF-8</option>
                <option value="EUC-JP">EUC-JP</option>
                <option value="GBK">GBK / GB2312 (簡体字中国語)</option>
                <option value="Big5">Big5 (繁体字中国語)</option>
                <option value="EUC-KR">EUC-KR (韓国語)</option>
              </select>
            </div>
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
