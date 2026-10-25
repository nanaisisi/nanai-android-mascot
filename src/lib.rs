pub mod app;
pub mod descript;
pub mod script;
pub mod vfs;

// 外部公開・後方互換のための再エクスポート
pub use descript::Descript;
pub use script::{execute_sakura_script, SakuraCommand};
pub use vfs::{open_shift_jis_file, open_text_file, resolve_vfs_path};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_open_shift_jis_file() {
        if let Ok(content) = open_shift_jis_file("sample/readme.txt") {
            assert!(!content.is_empty());
            println!("Content: {}", content);
        }
    }

    #[test]
    fn test_descript_parse() {
        let sample = "charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero.name,Mini\r\n";
        let desc = Descript::parse(sample);
        assert_eq!(desc.name().map(|s| s.as_str()), Some("SampleGhost"));
        assert_eq!(desc.sakura_name().map(|s| s.as_str()), Some("Nanai"));
        assert_eq!(desc.kero_name().map(|s| s.as_str()), Some("Mini"));
    }

    #[test]
    fn test_sakura_script_extended() {
        let script = r"\0\s[0]こんにちは\w5\n\q[はい,id_yes]\e";
        let mut commands = Vec::new();
        execute_sakura_script(script, |cmd| commands.push(cmd));

        assert_eq!(commands[0], SakuraCommand::Target(0));
        assert_eq!(commands[1], SakuraCommand::Surface(0));
        assert_eq!(commands[2], SakuraCommand::Text("こんにちは".into()));
        assert_eq!(commands[3], SakuraCommand::Wait(250));
        assert_eq!(commands[4], SakuraCommand::NewLine);
        assert_eq!(
            commands[5],
            SakuraCommand::Choice {
                label: "はい".into(),
                id: "id_yes".into()
            }
        );
        assert_eq!(commands[6], SakuraCommand::End);
    }
}
