/**
 * ヘルプ・ライセンス用 HTML テンプレート
 */
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

	"license-modal-content": `
    <h2>📜 著作権・ライセンス表示</h2>
    <div class="license-scroll-container">
      <section class="license-block">
        <h3>1. Nanai Android Mascot 本体</h3>
        <p><strong>Copyright &copy; 2025-2026 nanaisisi</strong></p>
        <p>本ソフトウェアは Apache License 2.0 または MIT License のデュアルライセンスのもとで公開されています。</p>
        <ul>
          <li>Apache License, Version 2.0 (<code>LICENSE-APACHE</code>)</li>
          <li>MIT License (<code>LICENSE-MIT</code>)</li>
        </ul>
      </section>

      <section class="license-block">
        <h3>2. 伺か仕様書・公式ドキュメントリファレンス</h3>
        <p>本ソフトウェアは、コミュニティ有志によって策定・保守されている以下の仕様書・公式ドキュメントを広く参照・準拠しています。</p>
        <ul>
          <li>
            <strong>UKADOC project / Ukagaka Tech Team (ukatech)</strong>:
            <a href="https://github.com/ukatech/ukadoc-spec" target="_blank" rel="noopener noreferrer">ukadoc-spec</a> /
            <a href="https://github.com/ukatech/ukadoc-ssp" target="_blank" rel="noopener noreferrer">ukadoc-ssp</a><br>
            <small>ライセンス: CC BY 4.0 | 著作権: © 2013- Ukagaka Tech Team / UKADOC Project contributors</small>
          </li>
          <li>
            <strong>YAYA 公式マニュアル</strong>:
            <a href="https://github.com/YAYA-shiori/yaya-docs" target="_blank" rel="noopener noreferrer">YAYA-shiori/yaya-docs</a><br>
            <small>ライセンス: The Unlicense（パブリックドメイン） | 著作権・編集: YAYA 整備班 および 旧 AYAYA Wiki 寄稿者有志</small>
          </li>
          <li>
            <strong>里々（SATORI）公式マニュアル</strong>:
            <a href="https://github.com/ukatech/satori-docs" target="_blank" rel="noopener noreferrer">ukatech/satori-docs</a><br>
            <small>ライセンス: BSD 2-Clause License | 著作権: Copyright &copy; 2001-2005, Kusigahama Yagi. / Copyright &copy; 2006-, SEIBIHAN.</small>
          </li>
          <li>
            <strong>華和梨（KAWARI）公式マニュアル</strong>:
            <a href="https://github.com/ukatech/kawari-docs" target="_blank" rel="noopener noreferrer">ukatech/kawari-docs</a><br>
            <small>ライセンス: BSD 2-Clause License | 著作権: Copyright &copy; 2001-2015, KAWARI Development Team</small>
          </li>
        </ul>
      </section>

      <section class="license-block">
        <h3>3. SHIORI サブシステム & 外部連携エンジン</h3>
        <h4>里々（SATORI）本体・同梱 SAORI (ssu) - BSD 2-Clause License</h4>
        <pre class="license-pre">Copyright (c) 2001-2005, Kusigahama Yagi.
Copyright (c) 2006-, SEIBIHAN. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.</pre>

        <h4>YAYA (yaya-shiori) - 修正 BSD ライセンス (BSD 3-Clause License)</h4>
        <pre class="license-pre">Copyright (c) 2007-, 整備班 (SEIBIHAN) All rights reserved. http://ms.shillest.net/

ソースコード形式かバイナリ形式か、変更するかしないかを問わず、以下の条件を満たす場合に限り、再頒布および使用が許可されます。
・ソースコードを再頒布する場合、上記の著作権表示、本条件一覧、および下記免責条項を含めること。
・バイナリ形式で再頒布する場合、頒布物に付属のドキュメント等の資料に、上記の著作権表示、本条件一覧、および下記免責条項を含めること。
・書面による特別の許可なしに、本ソフトウェアから派生した製品の宣伝または販売促進に、「整備班」の名前または貢献者の名前を使用してはならない。

本ソフトウェアは、著作権者および貢献者によって「現状のまま」提供されており、明示黙示を問わず、商業的な使用可能性、および特定の目的に対する適合性に関する暗黙の保証も含め、またそれに限定されない、いかなる保証もありません。著作権者も貢献者も、事由のいかんを問わず、損害発生の原因いかんを問わず、かつ責任の根拠が契約であるか厳格責任であるか（過失その他の）不法行為であるかを問わず、仮にそのような損害が発生する可能性を知らされていたとしても、本ソフトウェアの使用によって発生した直接損害、間接損害、偶発的な損害、特別損害、懲罰的損害、または結果損害について、一切責任を負わないものとします。</pre>

        <h4>華和梨（KAWARI） - BSD 2-Clause License</h4>
        <pre class="license-pre">Copyright (c) 2001-2015, KAWARI Development Team
(Meister (original works) / Nie / Nise-Meister / Sato / Shino / Suikyo)
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.</pre>
      </section>

      <section class="license-block">
        <h3>4. 謝辞 & 伺かエコシステム</h3>
        <p>
          本プロジェクトは、長年にわたり伺か文化・仕様を支えてこられたすべての開発者・クリエイターの皆様に敬意を表します。<br>
          また、Android 環境での先駆的ベースウェアである <strong>Ukadroid（伺か for Android）</strong> をはじめとする既存互換環境の成果を深く尊重しています。
        </p>
      </section>
    </div>
  `,
};
