/**
 * @file parser_edge_cases.rs
 * @brief surfaces.txt パーサーの開括弧位置・不正行・アニメーション行パース境界値単体テスト
 */

use super::*;

#[test]
fn test_parse_block_opener_edge_cases() {
    let sample = r"
sakura.cursor {
}
kero.cursor {
}
char0.cursor {
}
char1.cursor {
}
cursor {
}
char2.cursor
{
}
char2.cursor {
}
char2.cursor_invalid
{
}
sakura.tooltips {
}
kero.tooltips {
}
char0.tooltips {
}
char1.tooltips {
}
tooltips {
}
char3.tooltips
{
}
char3.tooltips {
}
char3.tooltips_invalid
{
}
surface.append.foo
{
}
surface.alias.bar
{
}
surface.foo
{
}
descript_extra
{
}
";
    let txt = SurfacesTxt::parse(sample);
    assert_eq!(txt.version, 0);
}

#[test]
fn test_lines_parser_edge_cases() {
    let sample = r"
charset,UTF-8
no_comma_root_line

descript
{
version,invalid_version
maxwidth,invalid_maxwidth
animation-sort,id
collision-sort,id
}

surface.alias
{
alias1,1,2
no_comma_alias_line
,empty_alias_name
}

sakura.cursor
{
mouserightdown,Head,sys1
mousewheel,Head,sys2
mousehover,Head,sys3
custom_event,Head,sys4
short_tokens
}

sakura.tooltips
{
no_comma_tooltip_line
Head,TooltipText
}

surface0
{
icon.rect,10,20,100,70
icon.rect,10,20
no_comma_surface_line
}
";
    let txt = SurfacesTxt::parse(sample);
    assert_eq!(txt.version, 0);
    assert!(txt.surface(0).is_some());
    assert_eq!(txt.surface(0).unwrap().icon_rect, Some([10, 20, 100, 70]));
}

#[test]
fn test_animation_handler_edge_cases() {
    let sample = r"surface0
{
animation
animationabc.interval,always
animation0.name,TestAnimation
animation0.option,optA,optB
animation0.collision0,0,0,10,10
animation0.pattern,base,0,10
animation1.pattern0,start,100,50
animation1.pattern1,stop,100,50
animation1.pattern2,alternativestart,100,50
animation1.pattern3,alternativestop,100,50
animation1.pattern4,parallelstart,100,50
animation1.pattern5,parallelstop,100,50
animation1.pattern6,base,6,100-50,0,0,(text),[bracket]
animation1.pattern7,base,6,invalid,0,0
animation1.pattern8,base,6,85-abc,0,0
}
";
    let txt = SurfacesTxt::parse(sample);
    assert!(txt.surface(0).is_some());
}
