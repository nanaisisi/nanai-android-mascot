/**
 * スキャン・テスト・デバッグ用 HTML テンプレート
 */
export const systemTemplates = {
	"scan-modal-content": `
    <h2>🔍 スキャンと検出</h2>
    <div class="form-section">
      <span class="form-label">スキャン対象:</span>
      <input type="text" id="scan-path" value="assets/" />
      <button type="button" id="start-scan-btn">スキャン開始</button>
    </div>
    <div class="form-section">
      <span class="form-label">スキャン結果:</span>
      <div class="scan-results" id="scan-results">
        <div class="info">
          スキャンボタンを押してファイルを検出してください。
        </div>
      </div>
    </div>
    <div class="form-section">
      <span class="form-label">デバッグ情報:</span>
      <div class="debug-info" id="scan-debug-info">
        <div class="info">スキャン時のデバッグ情報がここに表示されます。</div>
      </div>
    </div>
  `,

	"test-modal-content": `
    <h2>🧪 テスト機能</h2>
    <div class="form-section">
      <span class="form-label">SHIORI テスト:</span>
      <div class="test-controls">
        <button type="button" id="test-shiori-init">SHIORI初期化</button>
        <button type="button" id="test-shiori-request">リクエスト送信</button>
        <button type="button" id="test-shiori-finalize">SHIORI終了</button>
      </div>
    </div>
    <div class="form-section">
      <span class="form-label">テストメッセージ:</span>
      <input
        type="text"
        id="test-message"
        value="hello"
        placeholder="テストメッセージ"
      />
      <button type="button" id="send-test-message">メッセージ送信</button>
    </div>
    <div class="form-section">
      <span class="form-label">パステスト:</span>
      <div class="path-test-controls">
        <input
          type="text"
          id="path-test-input"
          value="../assets/ghost"
          placeholder="テストパス"
        />
        <button type="button" id="test-path-resolve">パス解決テスト</button>
      </div>
    </div>
    <div class="form-section">
      <span class="form-label">テスト結果:</span>
      <div class="test-results" id="test-results">
        <div class="info">テストボタンを押して結果を確認してください。</div>
      </div>
    </div>
  `,

	"debug-modal-content": `
    <h2>🐛 デバッグ情報</h2>
    <div class="form-section">
      <span class="form-label">システム情報:</span>
      <div class="debug-info" id="system-info">
        <div class="info-item">OS: <span id="os-info">取得中...</span></div>
        <div class="info-item">
          アプリバージョン: <span id="app-version">v1.0.0</span>
        </div>
        <div class="info-item">
          Tauri バージョン: <span id="tauri-version">取得中...</span>
        </div>
      </div>
    </div>
    <div class="form-section">
      <span class="form-label">ログレベル:</span>
      <select id="log-level">
        <option value="trace">詳細</option>
        <option value="debug" selected>デバッグ</option>
        <option value="info">情報</option>
        <option value="warn">警告</option>
        <option value="error">エラー</option>
      </select>
      <button type="button" id="apply-log-level">適用</button>
    </div>
    <div class="form-section">
      <span class="form-label">ログ出力:</span>
      <div class="log-output" id="log-output">
        <div class="log-entry info">デバッグログがここに表示されます。</div>
      </div>
      <div class="log-controls">
        <button type="button" id="clear-logs">ログクリア</button>
        <button type="button" id="export-logs">ログエクスポート</button>
      </div>
    </div>
  `,
};
