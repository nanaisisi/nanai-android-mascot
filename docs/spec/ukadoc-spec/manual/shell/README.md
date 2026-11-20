# ukadoc-spec/manual/shell 項目別突合

実装コードの文字列検索による一次調査です。

| 項目                                           | 検索語                                                   |                  対応状況                   |
| :--------------------------------------------- | :------------------------------------------------------- | :-----------------------------------------: |
| [`alias.txt`](alias-txt.md)                    | alias.txt                                                |                  ✅ 実装済                  |
| [`shell/master/descript.txt`](descript-txt.md) | read_descript                                            |                  ✅ 実装済                  |
| [`(element).pna`](element-pna.md)              | pnaFileName                                              |                  ✅ 実装済                  |
| [`(element).png`](element-png.md)              | composeSurfaceElements, compute_surface_composition_plan |                  ✅ 実装済                  |
| [`shell/master/makoto.dll`](makoto-dll.md)     | shell/master/makoto.dll                                  | ⚠️ 一部対応 (Windows 限定 / Android 非対応) |
| [readme-txt](readme-txt.md)                    | read_shell_readme, get_shell_readme                      |                  ✅ 実装済                  |
| [`surface*.pna`](surface-pna.md)               | load_surface_pna                                         |                  ✅ 実装済                  |
| [`surface*.png`](surface-png.md)               | load_surface_image                                       |                 ✅ 対応済み                 |
| [`surfaces**.txt`](surfaces-ext-txt.md)        | surfaces2.txt                                            |                  ✅ 実装済                  |
| [`surfaces.txt`](surfaces-txt.md)              | parse_surfaces_txt                                       |                  ✅ 実装済                  |
| [`surfacetable.txt`](surfacetable-txt.md)      | surfacetable.txt                                         |                  ✅ 実装済                  |
| [thumbnail-png](thumbnail-png.md)              | find_shell_thumbnail, get_shell_thumbnail                |                  ✅ 実装済                  |
