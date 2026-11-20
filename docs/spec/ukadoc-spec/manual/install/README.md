# ukadoc-spec/manual/install 項目別突合

実装コードの文字列検索による一次調査です。

| 項目                                                             | 検索語                            |  対応状況   |
| :--------------------------------------------------------------- | :-------------------------------- | :---------: |
| [標準的な追加シェル構成](additional-shell.md)                    | assets/shell                      |  ✅ 実装済  |
| [ゴーストへのバルーン等同梱構成](bundled-package.md)             | resolve_bundled_resources_config  |  ✅ 実装済  |
| [`developer_options.txt`](developer-options-txt.md)              | developer_options.txt             |  ✅ 実装済  |
| [`install.txt`](install-txt.md)                                  | parse_install_manifest            |  ✅ 実装済  |
| [SSP専用 複数インストール用パッケージ](multi-install-package.md) | buildInstallCompleteAllArgs       |  ✅ 実装済  |
| [`nar / zip / lzh / cab / exe` アーカイブ形式](nar-archive.md)   | install_ghost_archive, unlha32    | ⚠️ 一部対応 |
| [標準的なバルーン構成](standard-balloon.md)                      | flatten_balloon_directory         |  ✅ 実装済  |
| [標準的なゴーストパッケージ構成](standard-ghost.md)              | extract_ghost_archive_from_reader |  ✅ 実装済  |
| [`supplement` サプリメント構成](supplement.md)                   | supplement                        |  ✅ 実装済  |
