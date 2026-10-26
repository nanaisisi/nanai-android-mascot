pub mod animation;
pub mod app;
pub mod descript;
pub mod manifest;
pub mod script;
pub mod shell;
pub mod shiori;
pub mod surfaces;
pub mod surfacetable;
pub mod vfs;

// 外部公開・後方互換のための再エクスポート
pub use animation::{ScheduledFrame, Timeline, build_timeline, cycle_len_ms};
pub use descript::{BindGroup, BindOptionGroup, CharDefaults, Descript};
pub use manifest::{ShellManifest, SurfaceManifest};
pub use script::{SakuraCommand, execute_sakura_script, parse_sakura_script};
pub use shell::Shell;
pub use shiori::{
    ErrorLevel, GhostStatusToken, SecurityLevel, SenderTypeTag, ShioriMethod, ShioriRequest,
    ShioriResponse, StatusCode, parse_sender_types,
};
pub use surfaces::{
    BalloonOffset, CollisionArea, CollisionShape, CompositionLayer, CompositionPlan, DrawMethod,
    ElementDef, Interval, SerikoAnimation, SurfacesTxt, parse_surfaces_txt,
};
pub use surfacetable::{
    SurfTableEntry, SurfTableGroup, SurfaceTable, is_parts_name, parse_surface_table,
};
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
        let sample = "charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero.name,Mini\r\nicon,icon.ico\r\ncraftmanw,Author\r\n";
        let desc = Descript::parse(sample);
        assert_eq!(desc.name().map(|s| s.as_str()), Some("SampleGhost"));
        assert_eq!(desc.sakura_name().map(|s| s.as_str()), Some("Nanai"));
        assert_eq!(desc.kero_name().map(|s| s.as_str()), Some("Mini"));
        assert_eq!(desc.icon().map(|s| s.as_str()), Some("icon.ico"));
        assert_eq!(desc.craftmanw().map(|s| s.as_str()), Some("Author"));
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

    #[test]
    fn test_sakura_script_new_tags() {
        let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ribbon,1]";
        let mut commands = Vec::new();
        execute_sakura_script(script, |cmd| commands.push(cmd));

        assert_eq!(commands[0], SakuraCommand::Target(0));
        assert_eq!(commands[1], SakuraCommand::Quick(true));
        assert_eq!(commands[2], SakuraCommand::ClickWait);
        assert_eq!(
            commands[3],
            SakuraCommand::Anchor {
                id: "anchor01".into(),
                text: "リンク".into(),
            }
        );
        assert_eq!(
            commands[4],
            SakuraCommand::Raise {
                event: "OnTest".into(),
                references: vec!["1".into(), "2".into()],
            }
        );
        assert_eq!(
            commands[5],
            SakuraCommand::Bind {
                category: "clothing".into(),
                part: "ribbon".into(),
                status: Some(true),
            }
        );
    }

    #[test]
    fn test_sakura_script_extended_tags() {
        let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";
        let mut commands = Vec::new();
        execute_sakura_script(script, |cmd| commands.push(cmd));

        assert_eq!(commands[0], SakuraCommand::Balloon(0));
        assert_eq!(commands[1], SakuraCommand::Balloon(-1));
        assert_eq!(commands[2], SakuraCommand::Timeout);
        assert_eq!(commands[3], SakuraCommand::Halt);
        assert_eq!(commands[4], SakuraCommand::Sync(true));
        assert_eq!(
            commands[5],
            SakuraCommand::Offset {
                x: "10".into(),
                y: "20".into(),
            }
        );
        assert_eq!(
            commands[6],
            SakuraCommand::Font {
                tag: "color".into(),
                param: Some("red".into()),
            }
        );
        assert_eq!(
            commands[7],
            SakuraCommand::Font {
                tag: "bold".into(),
                param: None,
            }
        );
    }
}
