use serde::{Deserialize, Serialize};

/// さくらスクリプトの内部コマンド列挙
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum SakuraCommand {
    Target(u8),   // \0, \1, \p[n]
    Surface(u32), // \s[0], \s0
    Wait(u32),    // \w1..9, \_w[ms] (ミリ秒単位)
    ClickWait,    // \x (クリック/入力待ち)
    Quick(bool),  // \_q (高速表示トグル)
    NewLine {
        half: bool,
    }, // \n / \n[half]
    NewLineNoPause, // \_n
    AutoPause,    // \_?
    InlineBitmap {
        path: String,
        mode: String,
        x: Option<i32>,
        y: Option<i32>,
        opaque: bool,
    }, // \_b[...]
    PostMessage {
        umsg: String,
        wparam: String,
        lparam: String,
    }, // \m[umsg,wparam,lparam] (m-umsg-wparam-lparam.md)
    Clear,        // \c
    ClearArg {
        arg: String,
    }, // \c[char,n], \c[line,n]
    Choice {
        label: String,
        id: String,
        args: Vec<String>,
    }, // \q[label,id,r2,...]
    Anchor {
        id: String,
        text: String,
        args: Vec<String>,
    }, // \_a[id,r2,...]text\_a
    Star,         // \*
    Z,            // \z
    AudioWait,    // \a
    Jump(String), // \j[ID] / \j[URL] ジャンプ
    Plus,         // \+ / \_+
    Raise {
        event: String,
        references: Vec<String>,
    }, // \![raise,Event,...]
    PluginEvent {
        plugin: String,
        event: String,
        references: Vec<String>,
        is_notify: bool,
    }, // \![raiseplugin,...] / \![notifyplugin,...]
    Bind {
        category: String,
        part: String,
        status: Option<bool>,
    }, // \![bind,cat,part,status]
    Balloon(i32), // \b[n], \b[-1], \b0..\b9
    NoUserBreak(bool), // \_!
    Voice(String), // \__v[opt]
    Midi(String), // \_m[hex] MIDI/サウンドRAWコマンド
    ModeChange {
        mode: String,
        active: bool,
    },
    LockBalloonRepaint(bool),
    BalloonSetting {
        key: String,
        value: String,
        extra: Vec<String>,
    },
    Marker,
    Animation {
        id: u32,
        wait: bool,
    }, // \i[ID], \i[ID,wait]
    Timeout,    // \t (タイムアウト抑止)
    Halt,       // \- (ゴースト終了)
    Sync(bool), // \_s (複数キャラ同期発話トグル)
    Offset {
        x: String,
        y: String,
    }, // \_l[x,y] (座標移動)
    Font {
        tag: String,
        param: Option<String>,
    }, // \f[tag,param], \f[tag]
    Text(String), // 通常テキスト
    End,        // \e
    ScheduleAdd {
        date: String,
        time: String,
        title: String,
        memo: String,
    }, // \![execute,schedule-add,...]
    OpenDialog {
        dialog_type: String,
        id: String,
        args: Vec<String>,
    }, // \![open,inputbox,ID,...] 等
    ChoiceTimeout(u32),
    BalloonOffset {
        x: i32,
        y: i32,
    },
    BalloonTimeout(u32),
    LockBalloonMove(bool),
    WindowState(String),
    Change {
        target: String,
        name: String,
    },
    Call {
        target: String,
        name: String,
    },
    SetWallpaper {
        filename: String,
        option: String,
    },
    SaveWallpaper,
    RestoreWallpaper,
    Cancel {
        service: String,
        target: String,
    },
    Close {
        service: String,
        target: String,
    },
    ArchiveExec {
        action: String,
        filename: String,
        dest: String,
    },
    DownloadExec {
        url: String,
        save_path: String,
    },
    UploadExec {
        url: String,
        file_path: String,
    },
    MailCheckExec {
        account: String,
    },
    MailExec {
        action: String,
        target: String,
    },
    FileExec {
        action: String,
        path: String,
        dest: String,
    },
    SetHttpTimeout(u32),
    SetProxy {
        server: String,
        port: u16,
    },
    Biff,
    ExecuteSntp,
    CreateShortcut,
    Command {
        args: Vec<String>,
    }, // その他の \![...] 汎用透過
}

/// さくらスクリプトタグ・状態の寿命区分 (notes_lifespan.md)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SakuraScriptLifetime {
    /// 現在のスコープ（\0, \1 等）が切り替わるまで有効
    Scope,
    /// 現在のさくらスクリプト再生セッション終了（\e 等）まで有効
    Script,
    /// 次回明示的に変更されるまで永続的に有効
    Permanent,
}

impl SakuraCommand {
    /// コマンドの寿命分類を返す (notes_lifespan.md)
    pub fn lifetime(&self) -> SakuraScriptLifetime {
        match self {
            // スコープ固有のフォントや設定
            SakuraCommand::Font { .. } => SakuraScriptLifetime::Scope,

            // スクリプトセッション全体で維持され、\e でリセットされる状態
            SakuraCommand::Quick(_)
            | SakuraCommand::Sync(_)
            | SakuraCommand::NewLineNoPause
            | SakuraCommand::AutoPause
            | SakuraCommand::NoUserBreak(_)
            | SakuraCommand::LockBalloonRepaint(_)
            | SakuraCommand::LockBalloonMove(_)
            | SakuraCommand::ChoiceTimeout(_)
            | SakuraCommand::BalloonTimeout(_)
            | SakuraCommand::BalloonOffset { .. } => SakuraScriptLifetime::Script,

            // サーフィス、バインド、壁紙、プロキシ等の永続設定
            SakuraCommand::Surface(_)
            | SakuraCommand::Bind { .. }
            | SakuraCommand::WindowState(_)
            | SakuraCommand::SetWallpaper { .. }
            | SakuraCommand::SetProxy { .. }
            | SakuraCommand::SetHttpTimeout(_) => SakuraScriptLifetime::Permanent,

            // 一時的・瞬時発火コマンドはデフォルトでスクリプトスコープ
            _ => SakuraScriptLifetime::Script,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sakura_command_lifetime() {
        assert_eq!(
            SakuraCommand::Font {
                tag: "bold".into(),
                param: Some("1".into())
            }
            .lifetime(),
            SakuraScriptLifetime::Scope
        );
        assert_eq!(
            SakuraCommand::Quick(true).lifetime(),
            SakuraScriptLifetime::Script
        );
        assert_eq!(
            SakuraCommand::Sync(true).lifetime(),
            SakuraScriptLifetime::Script
        );
        assert_eq!(
            SakuraCommand::Surface(10).lifetime(),
            SakuraScriptLifetime::Permanent
        );
        assert_eq!(
            SakuraCommand::SetWallpaper {
                filename: "bg.png".into(),
                option: "center".into()
            }
            .lifetime(),
            SakuraScriptLifetime::Permanent
        );
    }
}
