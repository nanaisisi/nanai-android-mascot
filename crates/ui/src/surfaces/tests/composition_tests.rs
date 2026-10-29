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
