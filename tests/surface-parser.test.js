import assert from "node:assert/strict";
import { test } from "vitest";

const { expandSurfaceRange, parseSurfacesTxt } = await import(
	"../ui/js/surface/surface-parser.js"
);

test("surface-parser covers expandSurfaceRange and parseSurfacesTxt", () => {
	// 1. expandSurfaceRange
	const range = expandSurfaceRange("0-2,5");
	assert.deepEqual(range, ["0", "1", "2", "5"]);

	// 2. parseSurfacesTxt with various directives
	const sampleTxt = `
		// Comment
		surface0-1
		{
			collisionex0,head,rect,10,10,50,50
			collisionex1,circle,c1,20,20,10,10
			collision0,0,0,40,40,bust
			element0,overlay,surface0.png,0,0
			animation0.interval,always
			animation0.pattern0,overlay,6,85,0,0
		}

		surface2
		{
			0pattern0,6,85,overlay,0,0
		}
	`;

	const parsed = parseSurfacesTxt(sampleTxt);
	assert.ok(parsed.collisions["0"]);
	assert.ok(parsed.elements["0"]);
	assert.ok(parsed.animations["0"]);
	assert.ok(parsed.collisions["2"]);
});

test("surface-parser correctly resolves multiple animations and patterns using ID indexing", () => {
	const sampleTxt = `
		surface10
		{
			animation1.interval,sometimes
			animation1.option,exclusive
			animation1.pattern0,overlay,100,50,0,0
			animation1.pattern1,overlay,101,60,10,10
			animation2.interval,rarely
			animation2.pattern0,replace,200,80,0,0
		}
	`;

	const parsed = parseSurfacesTxt(sampleTxt);
	const anims = parsed.animations["10"];
	assert.equal(anims.length, 2);

	const anim1 = anims.find((a) => a.id === 1);
	assert.ok(anim1);
	assert.equal(anim1.interval, "sometimes");
	assert.deepEqual(anim1.options, ["exclusive"]);
	assert.equal(anim1.patterns.length, 2);
	assert.equal(anim1.patterns[0].surface, "100");
	assert.equal(anim1.patterns[1].surface, "101");

	const anim2 = anims.find((a) => a.id === 2);
	assert.ok(anim2);
	assert.equal(anim2.interval, "rarely");
	assert.equal(anim2.patterns.length, 1);
	assert.equal(anim2.patterns[0].surface, "200");
});

test("surface-parser extracts *.cursor and *.tooltips blocks", () => {
	const sampleTxt = `
		sakura.cursor
		{
			mouseup0,Head,system:hand
			mousedown0,Head,system:finger
			mousehover0,Face,system:cross
		}

		kero.cursor
		{
			mousedown0,Tail,system:finger
		}

		sakura.tooltips
		{
			Head,つつかないで！
			Bust,怒ります。
		}

		kero.tooltips
		{
			Tail,しっぽです
		}
	`;

	const parsed = parseSurfacesTxt(sampleTxt);
	assert.ok(parsed.cursors.sakura);
	assert.equal(parsed.cursors.sakura.length, 3);
	assert.equal(parsed.cursors.sakura[0].event, "mouseup");
	assert.equal(parsed.cursors.sakura[0].collision, "Head");
	assert.equal(parsed.cursors.sakura[0].cursor, "system:hand");

	assert.ok(parsed.cursors.kero);
	assert.equal(parsed.cursors.kero.length, 1);
	assert.equal(parsed.cursors.kero[0].cursor, "system:finger");

	assert.ok(parsed.tooltips.sakura);
	assert.equal(parsed.tooltips.sakura.Head, "つつかないで！");
	assert.equal(parsed.tooltips.sakura.Bust, "怒ります。");

	assert.ok(parsed.tooltips.kero);
	assert.equal(parsed.tooltips.kero.Tail, "しっぽです");
});

test("surface-parser extracts point and balloon offset definitions", () => {
	const sampleTxt = `
		surface0
		{
			point.centerx,150
			point.centery,250
			point.basepos.x,120
			point.basepos.y,380
			point.kinoko.centerx,140
			point.kinoko.centery,220
			balloon.offsetx,10
			balloon.offsety,20
			sakura.balloon.offsetx,-15
			sakura.balloon.offsety,-30
			kero.balloon.offsetx,45
			kero.balloon.offsety,60
		}
	`;

	const parsed = parseSurfacesTxt(sampleTxt);
	assert.ok(parsed.points["0"]);
	assert.equal(parsed.points["0"].center_x, 150);
	assert.equal(parsed.points["0"].center_y, 250);
	assert.equal(parsed.points["0"].basepos_x, 120);
	assert.equal(parsed.points["0"].basepos_y, 380);
	assert.equal(parsed.points["0"].kinoko_center_x, 140);
	assert.equal(parsed.points["0"].kinoko_center_y, 220);

	assert.ok(parsed.balloonOffsets["0"]);
	assert.equal(parsed.balloonOffsets["0"]["*"].x, 10);
	assert.equal(parsed.balloonOffsets["0"]["*"].y, 20);
	assert.equal(parsed.balloonOffsets["0"].sakura.x, -15);
	assert.equal(parsed.balloonOffsets["0"].sakura.y, -30);
	assert.equal(parsed.balloonOffsets["0"].kero.x, 45);
	assert.equal(parsed.balloonOffsets["0"].kero.y, 60);
});
