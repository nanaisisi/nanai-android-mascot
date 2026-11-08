/**
 * @file tests.rs
 * @brief 設定系ブラケットコマンドハンドラー単体テスト
 */

use super::handlers::*;

#[test]
fn test_settings_handlers() {
    let mut commands = Vec::new();
    let mut cb = |cmd| commands.push(cmd);

    handle_enter_leave(&["enter".to_string(), "mode1".to_string()], &mut cb);
    handle_enter_leave(&["leave".to_string(), "mode1".to_string()], &mut cb);

    handle_bind(
        &[
            "bind".to_string(),
            "hats".to_string(),
            "ribbon".to_string(),
            "1".to_string(),
        ],
        &mut cb,
    );
    handle_bind(
        &[
            "bind".to_string(),
            "hats".to_string(),
            "ribbon".to_string(),
            "false".to_string(),
        ],
        &mut cb,
    );
    handle_bind(
        &[
            "bind".to_string(),
            "hats".to_string(),
            "ribbon".to_string(),
            "invalid".to_string(),
        ],
        &mut cb,
    );

    handle_open(
        &[
            "open".to_string(),
            "calendar".to_string(),
            "id1".to_string(),
        ],
        &mut cb,
    );
    handle_open(
        &[
            "open".to_string(),
            "calendar".to_string(),
            "id1".to_string(),
            "arg1".to_string(),
            "arg2".to_string(),
        ],
        &mut cb,
    );

    handle_set(&["set".to_string(), "quicksection".to_string()], &mut cb);
    handle_set(
        &[
            "set".to_string(),
            "quicksection".to_string(),
            "0".to_string(),
        ],
        &mut cb,
    );
    handle_set(
        &[
            "set".to_string(),
            "quicksection".to_string(),
            "false".to_string(),
        ],
        &mut cb,
    );
    handle_set(
        &[
            "set".to_string(),
            "quicksection".to_string(),
            "1".to_string(),
        ],
        &mut cb,
    );

    handle_set(
        &[
            "set".to_string(),
            "choicetimeout".to_string(),
            "10".to_string(),
        ],
        &mut cb,
    );
    handle_set(
        &[
            "set".to_string(),
            "balloonoffset".to_string(),
            "100".to_string(),
            "200".to_string(),
        ],
        &mut cb,
    );
    handle_set(
        &[
            "set".to_string(),
            "balloontimeout".to_string(),
            "5".to_string(),
        ],
        &mut cb,
    );
    handle_set(
        &[
            "set".to_string(),
            "windowstate".to_string(),
            "normal".to_string(),
        ],
        &mut cb,
    );
    handle_set(
        &[
            "set".to_string(),
            "wallpaper".to_string(),
            "bg.png".to_string(),
            "tile".to_string(),
        ],
        &mut cb,
    );
    handle_set(
        &[
            "set".to_string(),
            "httptimeout".to_string(),
            "30".to_string(),
        ],
        &mut cb,
    );
    handle_set(
        &[
            "set".to_string(),
            "proxy".to_string(),
            "proxy.com".to_string(),
        ],
        &mut cb,
    );
    handle_set(
        &[
            "set".to_string(),
            "proxy".to_string(),
            "proxy.com".to_string(),
            "8080".to_string(),
        ],
        &mut cb,
    );
    handle_set(
        &[
            "set".to_string(),
            "autoscroll".to_string(),
            "true".to_string(),
        ],
        &mut cb,
    );
    handle_set(
        &[
            "set".to_string(),
            "autoscroll".to_string(),
            "true".to_string(),
            "extra".to_string(),
        ],
        &mut cb,
    );
    handle_set(&["set".to_string(), "unknownsetting".to_string()], &mut cb);

    handle_lock_unlock(&["lock".to_string(), "balloonmove".to_string()], &mut cb);
    handle_lock_unlock(
        &["unlock".to_string(), "balloonrepaint".to_string()],
        &mut cb,
    );
    handle_lock_unlock(&["lock".to_string(), "other".to_string()], &mut cb);

    handle_marker(&mut cb);
    handle_change(
        &[
            "change".to_string(),
            "shell".to_string(),
            "master".to_string(),
        ],
        &mut cb,
    );
    handle_call(
        &[
            "call".to_string(),
            "ghost".to_string(),
            "master".to_string(),
        ],
        &mut cb,
    );

    assert!(!commands.is_empty());
}
