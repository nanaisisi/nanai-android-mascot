use crate::surfaces::*;

#[test]
fn test_plan_composition() {
    let sample = r"charset,Shift_JIS
surface0
{
element0,base,surface0.png,0,0
collisionex0,head,rect,0,0,10,10
animation100.interval,bind
animation100.pattern0,add,100,0,0,0
animation100.pattern1,add,101,0,0,0
animation200.interval,sometimes
animation200.pattern0,overlay,9,500,0,0
}

surface.append0
{
element1,overlay,surface01.png,0,0
}
";
    let txt = SurfacesTxt::parse(sample);

    let plan = txt.plan_composition(0, &[]).unwrap();
    assert_eq!(plan.layers.len(), 2);
    assert_eq!(
        plan.layer_files(),
        vec!["surface0.png".to_string(), "surface01.png".to_string()]
    );

    let plan = txt.plan_composition(0, &[100]).unwrap();
    assert_eq!(plan.bind_pattern_count(), 2);
    assert_eq!(
        plan.layers[2],
        CompositionLayer::Pattern(AnimationPattern {
            index: 0,
            method: DrawMethod::Add,
            surface: 100,
            wait: 0,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        })
    );
}

#[test]
fn test_plan_composition_insert_method() {
    let sample = r"charset,UTF-8
surface0
{
element0,base,surface0.png,0,0

// 着せ替えA: 下着 (10) と 上着 (11) の間に スカート (20) を挿入
animation10.interval,bind
animation10.pattern0,add,1001,0,0,0
animation10.pattern1,insert,20,0,0,0
animation10.pattern2,add,1002,0,0,0

// 着せ替えB: スカート
animation20.interval,bind
animation20.pattern0,add,2001,0,0,0
}
";
    let txt = SurfacesTxt::parse(sample);

    // 両方有効な場合: 1001 -> 2001 -> 1002 の順に挟まる
    let plan = txt.plan_composition(0, &[10, 20]).unwrap();
    assert_eq!(
        plan.layer_files(),
        vec![
            "surface0.png".to_string(),
            "1001".to_string(),
            "2001".to_string(),
            "1002".to_string()
        ]
    );

    // 20 が無効な場合: 1001 -> 1002 のみ
    let plan2 = txt.plan_composition(0, &[10]).unwrap();
    assert_eq!(
        plan2.layer_files(),
        vec![
            "surface0.png".to_string(),
            "1001".to_string(),
            "1002".to_string()
        ]
    );

    // 20 単体の場合: 通常描画
    let plan3 = txt.plan_composition(0, &[20]).unwrap();
    assert_eq!(
        plan3.layer_files(),
        vec!["surface0.png".to_string(), "2001".to_string()]
    );
}
