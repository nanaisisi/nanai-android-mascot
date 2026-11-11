# CompressArchive

- **規格**: [internal_file.CompressArchive.md](https://ukatech.shillest.net/ukadoc-spec/spec/saori-ex/internal_file/internal_file.CompressArchive/) (ukadoc-spec/spec/saori-ex/internal_file/internal_file.CompressArchive.md)
- **検索語**: CompressArchive
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コードに「CompressArchive」が見つからない。


## 実装箇所

- `crates/ui/src/sstp/tests/execution/command_context/execute_commands/security_fmo.rs:43` `handle_execute_command("CompressArchive[/a,/b]", &ctx_remote).status,`
- `crates/ui/src/sstp/tests/execution/command_context/execute_commands/system_archive.rs:28` `handle_execute_command("CompressArchive[/path/out.zip,/path/in]", &ctx).status,`
- `crates/ui/src/sstp/tests/execution/command_context/execute_commands/system_archive.rs:36` `handle_execute_command("CompressArchive[]", &ctx).status,`
