# インストール仕様の項目別突合

- **規格**: [ukadoc-spec/manual/install.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/install.md)
- **判定基準**: このリポジトリで確認できる NAR/ZIP インストール、install.txt 解析、ネットワーク更新、アンインストール処理

| 項目                                             | 対応状況 |
| ------------------------------------------------ | -------- |
| [NAR / ZIP アーカイブ展開](nar-install.md)       | ✅ 実装済  |
| [install.txt 解析](install-txt.md)               | ✅ 実装済  |
| [ネットワーク更新 (`updates2.dau`)](update-install.md) | ✅ 実装済  |
| [アンインストール (`uninstall_ghost`)](uninstall.md)  | ✅ 実装済  |

## 対応範囲の共通事項

- 拡張子 `.nar` または `.zip` のアーカイブを受信し、ZipSlip 防止機構付きで安全に展開。
- `install.txt` の `type`（ghost, balloon, shell 等）および `directory` を判定して適切なアセットパスへ配置。
