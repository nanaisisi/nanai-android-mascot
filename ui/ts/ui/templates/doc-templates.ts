/**
 * ヘルプ・ライセンス用 HTML テンプレート
 */
import { licenseModalContent } from "./license-template.js";

export { licenseModalContent } from "./license-template.js";

export const docTemplates = {
	"help-modal-content": `
    <h2>❓ ヘルプ</h2>
    <div class="help-section">
      <h3>使い方</h3>
      <p>
        Mascot Nanaiは、デスクトップマスコット(ゴースト)を表示するアプリケーションです。
      </p>
      <ul>
        <li>
          <strong>ゴースト:</strong>
          右上メニューからゴーストを選択・管理できます
        </li>
        <li><strong>バルーン:</strong> 吹き出しスタイルを変更できます</li>
        <li><strong>表示:</strong> キャラクターをクリックして操作できます</li>
        <li><strong>設定:</strong> 右上メニューで各種設定を変更できます</li>
      </ul>
    </div>
    <div class="help-section">
      <h3>キーボードショートカット</h3>
      <ul>
        <li><kbd>Esc</kbd>: モーダルを閉じる</li>
        <li><kbd>Ctrl+R</kbd>: ゴースト更新</li>
        <li><kbd>右クリック</kbd>: メニュー表示</li>
      </ul>
    </div>
    <div class="help-section">
      <h3>トラブルシューティング</h3>
      <ul>
        <li>
          <strong>ゴーストが読み込めない:</strong>
          ゴーストディレクトリのパスを確認してください
        </li>
        <li>
          <strong>表示が見えない:</strong>
          設定で「常に最前面に表示」を有効にしてください
        </li>
        <li>
          <strong>ファイルが見つからない:</strong>
          スキャン機能で利用可能なファイルを確認してください
        </li>
      </ul>
    </div>
    <div class="help-section">
      <h3>ライセンス・著作権情報</h3>
      <p>
        このソフトウェアは Apache-2.0 と MIT
        のデュアルライセンスの下で提供されています。
      </p>
      <p>
        詳細はメニューの「📜 著作権・ライセンス表示」または <code>LICENSE-APACHE</code> / <code>LICENSE-MIT</code> をご覧ください。
      </p>
    </div>
  `,

	"license-modal-content": licenseModalContent,
};
