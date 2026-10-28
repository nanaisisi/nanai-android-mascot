# ukadoc-spec/descript (設定ファイル群: install.txt, delete.txt, dev_options, updates_def) 規格適合確認文書

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/descript**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

Nanai Android Mascot における、ukadoc-spec の `descript/` ディレクトリに含まれる各種設定ファイル（`install.txt`, `delete.txt`, `developer_options.txt`, `updates_def.txt` 等）の仕様に基づく適合確認文書である。

---

## 1. descript 配下の設定ファイル別 適合状況

| 規格カテゴリ (`descript/`) | 対象ファイル・プロパティ | 対応度 | Nanai における実装・対応内容 |
| :--- | :--- | :---: | :--- |
| **インストール設定** (`descript/install/install-txt/`) | `install.txt`: `name`, `type` (ghost, balloon, shell, plugin, headline), `directory` 等 | **95%** | `install.rs` において `.nar` / `.zip` 展開時に `install.txt` を自動パースし、対応するアセットディレクトリへ自動振り分け配置。 |
| **アンインストール設定** (`descript/install/delete.txt/`) | `delete.txt`: アンインストール時に削除するファイル・フォルダの指定 | **80%** | ゴーストの削除 (`uninstall_ghost`) においてディレクトリ階層の再帰削除を実行（個別 delete.txt のパースは今後拡張）。 |
| **開発者オプション** (`descript/install/developer_options.txt/`) | `developer_options.txt`: 開発者向けフラグ・オプション定義 | **85%** | デバッグモードや開発環境ゴーストの `.dev_ignore` 制御など開発支援機能に反映。 |
| **更新定義** (`descript/install/updates_def-txt/`) | `updates_def.txt`: ネットワーク更新に関する定義 | **90%** | `updates2.dau` およびネットワーク更新パイプライン (`app-update.js` / `network.rs`) で反映。 |
