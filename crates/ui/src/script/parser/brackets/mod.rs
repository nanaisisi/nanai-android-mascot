//! さくらスクリプトの括弧コマンド（`\s[N]` / `\_w[N]` / `\![...]` 等）処理モジュール

pub mod handlers;
pub mod utils;

pub(crate) use handlers::{
    handle_animation, handle_balloon, handle_choice, handle_font, handle_newline, handle_raiselike,
    handle_surface, handle_target_p, handle_underscore,
};
pub(crate) use utils::consume_tag_tail;

#[cfg(test)]
mod tests {
    use super::super::SakuraCommand;
    use super::*;
    use crate::script::parser::brackets::utils::{read_bracketed, read_digit};

    #[test]
    fn test_brackets_helpers() {
        let mut empty_chars = "".chars().peekable();
        assert_eq!(read_digit(&mut empty_chars), None);
        let mut chars = "abc".chars().peekable();
        assert_eq!(read_digit(&mut chars), None);
        assert_eq!(handle_surface(&mut chars), None);
        assert_eq!(handle_balloon(&mut chars), None);
        assert_eq!(handle_animation(&mut chars), None);

        let mut chars = "[123]".chars().peekable();
        assert_eq!(read_bracketed(&mut chars), Some("123".to_string()));

        let mut chars = "5abc".chars().peekable();
        assert_eq!(read_digit(&mut chars), Some(5));

        let mut chars = "[half]".chars().peekable();
        assert_eq!(handle_newline(&mut chars), Some(true));

        let mut chars = "[bold,1]".chars().peekable();
        assert_eq!(
            handle_font(&mut chars),
            Some(("bold".to_string(), Some("1".to_string())))
        );

        let mut chars = "[-1]".chars().peekable();
        assert_eq!(handle_balloon(&mut chars), Some(-1));

        let mut chars = "[0]".chars().peekable();
        assert_eq!(handle_target_p(&mut chars), Some(0));

        let mut chars = "[1,wait]".chars().peekable();
        assert_eq!(handle_animation(&mut chars), Some((1, true)));
    }

    #[test]
    fn test_raiselike_and_choice() {
        let mut cmds = Vec::new();
        let mut chars = "[raise,OnTest,ref1]".chars().peekable();
        handle_raiselike(&mut chars, &mut |c| cmds.push(c));
        assert_eq!(cmds.len(), 1);

        let mut chars = "[ChoiceText,ChoiceID]".chars().peekable();
        let choice = handle_choice(&mut chars);
        assert_eq!(
            choice,
            Some(("ChoiceText".to_string(), "ChoiceID".to_string()))
        );

        let mut chars = "[temp,TempText,TempID]".chars().peekable();
        let choice_temp = handle_choice(&mut chars);
        assert_eq!(
            choice_temp,
            Some(("TempText".to_string(), "TempID".to_string()))
        );
    }

    #[test]
    fn test_underscore_handlers() {
        let mut cmds = Vec::new();
        let mut chars = "w[100]".chars().peekable();
        handle_underscore(&mut chars, &mut |c| cmds.push(c));
        assert_eq!(cmds, vec![SakuraCommand::Wait(100)]);

        let mut cmds = Vec::new();
        let mut chars = "q[0]".chars().peekable();
        handle_underscore(&mut chars, &mut |c| cmds.push(c));
        assert_eq!(cmds, vec![SakuraCommand::Quick(false)]);

        let mut cmds = Vec::new();
        let mut chars = "s[1]".chars().peekable();
        handle_underscore(&mut chars, &mut |c| cmds.push(c));
        assert_eq!(cmds, vec![SakuraCommand::Sync(true)]);

        let mut cmds = Vec::new();
        let mut chars = "l[10,20]".chars().peekable();
        handle_underscore(&mut chars, &mut |c| cmds.push(c));
        assert_eq!(
            cmds,
            vec![SakuraCommand::Offset {
                x: "10".into(),
                y: "20".into()
            }]
        );

        let mut cmds = Vec::new();
        let mut chars = "a[anchor1]text\\_a".chars().peekable();
        handle_underscore(&mut chars, &mut |c| cmds.push(c));
        assert_eq!(
            cmds,
            vec![SakuraCommand::Anchor {
                id: "anchor1".into(),
                text: "text".into()
            }]
        );
    }

    #[test]
    fn test_handlers_extended_edge_cases() {
        let mut cmds = Vec::new();
        let mut chars = "[bind,cat,part,0]".chars().peekable();
        handle_raiselike(&mut chars, &mut |c| cmds.push(c));

        let mut cmds2 = Vec::new();
        let mut chars2 = "[bind,cat,part,invalid_status]".chars().peekable();
        handle_raiselike(&mut chars2, &mut |c| cmds2.push(c));

        let mut cmds3 = Vec::new();
        let mut chars3 = "[unknown_cmd,arg1]".chars().peekable();
        handle_raiselike(&mut chars3, &mut |c| cmds3.push(c));

        let mut chars4 = "5".chars().peekable();
        assert_eq!(handle_balloon(&mut chars4), Some(5));

        let mut chars5 = "2".chars().peekable();
        assert_eq!(handle_target_p(&mut chars5), Some(2));

        let mut chars6 = "3".chars().peekable();
        assert_eq!(handle_animation(&mut chars6), Some((3, false)));

        let mut chars7 = "x".chars().peekable();
        let mut cmds7 = Vec::new();
        handle_underscore(&mut chars7, &mut |c| cmds7.push(c));
    }
}
