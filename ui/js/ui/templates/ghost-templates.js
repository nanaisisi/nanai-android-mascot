/**
 * ゴースト・バルーン・導入管理用 HTML テンプレート
 */
export const ghostTemplates = {
	"explorer-modal-content": `
    <h2>🗂 エクスプローラ</h2>
    <div class="explorer-toolbar">
      <button type="button" id="explorer-refresh-btn">再読み込み</button>
      <input type="search" id="explorer-search" placeholder="名前・作者名を検索" />
      <button type="button" id="explorer-search-next-btn">次を検索</button>
    </div>
    <div class="explorer-table-wrap">
      <table class="explorer-table">
        <thead><tr>
          <th data-sort="name">名前</th><th data-sort="craftman">作者名</th>
          <th data-sort="path">パス</th><th>グループ</th>
          <th data-sort="installDate">インストール日時</th><th data-sort="updateDate">更新日時</th>
          <th>更新結果</th><th data-sort="sakura_name">¥0名</th><th data-sort="kero_name">¥1名</th>
        </tr></thead>
        <tbody id="explorer-rows"></tbody>
      </table>
    </div>
    <div class="explorer-footer">
      <span id="explorer-status"></span>
      <button type="button" id="explorer-close-btn">閉じる</button>
      <button type="button" class="primary" id="explorer-switch-btn">切り替え</button>
    </div>
  `,

	"ghost-modal-content": `
    <h2>👻 ゴースト管理</h2>
    <div class="form-section">
      <span class="form-label">現在のゴースト:</span>
      <div class="current-ghost" id="current-ghost">未選択</div>
    </div>
    <div class="form-section">
      <span class="form-label">利用可能なゴースト:</span>
      <div class="ghost-list" id="ghost-list">
        <div class="loading">ゴーストを読み込み中...</div>
      </div>
    </div>
    <div class="form-section">
      <span class="form-label">ゴースト取り込み (.nar / .zip):</span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: stretch; margin-top: 4px;">
        <input type="file" id="ghost-archive-input" accept=".nar,.zip" style="flex: 1 1 180px; min-width: 0; max-width: 100%; padding: 6px; font-size: 13px; box-sizing: border-box;" />
        <button type="button" id="import-ghost-btn" class="primary" style="flex: 0 0 auto; white-space: nowrap; padding: 6px 14px; font-size: 13px; cursor: pointer;">取り込み</button>
      </div>
      <div id="import-ghost-status" style="font-size: 12px; margin-top: 4px; color: #666; word-break: break-all;"></div>
    </div>
    <div class="form-section">
      <span class="form-label">ゴーストディレクトリ:</span>
      <input type="text" id="ghost-directory" value="assets/ghost" />
      <button type="button" id="refresh-ghosts-btn">更新</button>
    </div>
  `,

	"balloon-modal-content": `
    <h2>💭 バルーン管理</h2>
    <div class="form-section">
      <span class="form-label">現在のバルーン:</span>
      <div class="current-balloon" id="current-balloon">デフォルト</div>
    </div>
    <div class="form-section">
      <span class="form-label">利用可能なバルーン:</span>
      <div class="balloon-list" id="balloon-list">
        <div class="balloon-item active" data-balloon="default">
          <span>デフォルト</span>
        </div>
      </div>
    </div>
    <div class="form-section">
      <span class="form-label">バルーンディレクトリ:</span>
      <input type="text" id="balloon-directory" value="assets/balloon" />
      <button type="button" id="refresh-balloons-btn">更新</button>
    </div>
  `,

	"install-modal-content": `
    <h2>📥 ファイル取り込み・導入</h2>
    <div class="form-section">
      <p style="font-size: 13px; color: #444; margin-bottom: 12px; line-height: 1.5;">
        伺かゴーストアーカイブ（<code>.nar</code> または <code>.zip</code>）を選択して取り込みます。<br>
        取り込んだゴーストは <code>assets/ghost/</code> 配下に自動展開され、すぐに切り替えて遊ぶことができます。
      </p>
      <span class="form-label">アーカイブファイルを選択:</span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: stretch; margin-top: 6px;">
        <button type="button" id="modal-install-select-btn" style="flex: 1 1 200px; padding: 6px; font-size: 13px; cursor: pointer;">ファイルを選択...</button>
        <button type="button" id="modal-install-submit-btn" class="primary" style="flex: 0 0 auto; white-space: nowrap; padding: 6px 16px; font-size: 13px; cursor: pointer;">取り込み実行</button>
      </div>
      <div id="modal-install-status" style="font-size: 12px; margin-top: 8px; min-height: 18px; color: #666; word-break: break-all;"></div>
    </div>
    <div class="help-section" style="margin-top: 15px;">
      <h3>対応形式と仕様</h3>
      <ul>
        <li><strong>.nar / .zip アーカイブ:</strong> ゴースト配布アーカイブ</li>
        <li><strong>install.txt 自動解析:</strong> ゴースト名・ディレクトリ設定を自動認識</li>
        <li><strong>Shift_JIS / UTF-8 両対応:</strong> 歴史的な日本語文字コードも自動判別して安全に展開</li>
      </ul>
    </div>
  `,
};
