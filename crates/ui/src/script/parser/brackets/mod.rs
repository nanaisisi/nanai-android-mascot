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

        let mut cmds_raise = Vec::new();
        let mut chars_raise = "[raise]".chars().peekable();
        handle_raiselike(&mut chars_raise, &mut |c| cmds_raise.push(c));

        let mut cmds_bind = Vec::new();
        let mut chars_bind = "[bind]".chars().peekable();
        handle_raiselike(&mut chars_bind, &mut |c| cmds_bind.push(c));

        let mut cmds_un = Vec::new();
        let mut chars_un = "no_bracket".chars().peekable();
        handle_raiselike(&mut chars_un, &mut |c| cmds_un.push(c));

        let mut chars4 = "5".chars().peekable();
        assert_eq!(handle_balloon(&mut chars4), Some(5));

        let mut chars5 = "2".chars().peekable();
        assert_eq!(handle_target_p(&mut chars5), Some(2));

        let mut chars6 = "3".chars().peekable();
        assert_eq!(handle_animation(&mut chars6), Some((3, false)));

        let mut chars_anim2 = "[1]".chars().peekable();
        assert_eq!(handle_animation(&mut chars_anim2), Some((1, false)));

        let mut chars_anim3 = "[ ,wait]".chars().peekable();
        assert_eq!(handle_animation(&mut chars_anim3), None);

        let mut chars_anim4 = "[abc,wait]".chars().peekable();
        assert_eq!(handle_animation(&mut chars_anim4), None);

        let mut chars_anim5 = "a".chars().peekable();
        assert_eq!(handle_animation(&mut chars_anim5), None);

        let mut chars_font2 = "no_bracket".chars().peekable();
        assert_eq!(handle_font(&mut chars_font2), None);

        let mut chars_font3 = "[bold]".chars().peekable();
        assert_eq!(handle_font(&mut chars_font3), Some(("bold".to_string(), None)));

        let mut chars_choice2 = "no_bracket".chars().peekable();
        assert_eq!(handle_choice(&mut chars_choice2), None);

        let mut chars_choice3 = "[JustLabel]".chars().peekable();
        assert_eq!(handle_choice(&mut chars_choice3), Some(("JustLabel".to_string(), "".to_string())));

        let mut chars_w = "w[abc]".chars().peekable();
        let mut cmds_w = Vec::new();
        handle_underscore(&mut chars_w, &mut |c| cmds_w.push(c));
        assert!(cmds_w.is_empty());

        let mut chars_w2 = "wno_bracket".chars().peekable();
        let mut cmds_w2 = Vec::new();
        handle_underscore(&mut chars_w2, &mut |c| cmds_w2.push(c));
        assert!(cmds_w2.is_empty());

        let mut chars_q = "q".chars().peekable();
        let mut cmds_q = Vec::new();
        handle_underscore(&mut chars_q, &mut |c| cmds_q.push(c));
        assert_eq!(cmds_q.pop(), Some(SakuraCommand::Quick(true)));

        let mut chars_q2 = "q[invalid]".chars().peekable();
        let mut cmds_q2 = Vec::new();
        handle_underscore(&mut chars_q2, &mut |c| cmds_q2.push(c));
        assert_eq!(cmds_q2.pop(), Some(SakuraCommand::Quick(true)));

        let mut chars_s = "s".chars().peekable();
        let mut cmds_s = Vec::new();
        handle_underscore(&mut chars_s, &mut |c| cmds_s.push(c));
        assert_eq!(cmds_s.pop(), Some(SakuraCommand::Sync(true)));

        let mut chars_s2 = "s[invalid]".chars().peekable();
        let mut cmds_s2 = Vec::new();
        handle_underscore(&mut chars_s2, &mut |c| cmds_s2.push(c));
        assert_eq!(cmds_s2.pop(), Some(SakuraCommand::Sync(true)));

        let mut chars_l = "l[10]".chars().peekable();
        let mut cmds_l = Vec::new();
        handle_underscore(&mut chars_l, &mut |c| cmds_l.push(c));
        assert_eq!(cmds_l.pop(), Some(SakuraCommand::Offset { x: "10".to_string(), y: "0".to_string() }));

        let mut chars_l2 = "lno_bracket".chars().peekable();
        let mut cmds_l2 = Vec::new();
        handle_underscore(&mut chars_l2, &mut |c| cmds_l2.push(c));
        assert!(cmds_l2.is_empty());

        let mut chars_a = "ano_bracket".chars().peekable();
        let mut cmds_a = Vec::new();
        handle_underscore(&mut chars_a, &mut |c| cmds_a.push(c));
        assert!(cmds_a.is_empty());

        let mut chars_a2 = "a[id]text\\_b\\_a".chars().peekable();
        let mut cmds_a2 = Vec::new();
        handle_underscore(&mut chars_a2, &mut |c| cmds_a2.push(c));
        assert_eq!(cmds_a2.pop(), Some(SakuraCommand::Anchor { id: "id".to_string(), text: "text\\b".to_string() }));

        let mut chars7 = "x".chars().peekable();
        let mut cmds7 = Vec::new();
        handle_underscore(&mut chars7, &mut |c| cmds7.push(c));
    }
}
