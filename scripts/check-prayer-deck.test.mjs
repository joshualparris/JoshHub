import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";
import test from "node:test";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const page=read("public/prayer-deck.html"),research=read("docs/prayer-daily-rituals-2026-10-29.md");
const layout=read("src/app/layout.tsx"),dashboard=read("src/app/dashboard/page.tsx");
const life=read("src/app/life/[slug]/life-detail-client.tsx"),search=read("src/components/global-search.tsx");

test("Prayer deck is complete and has original illustrated starter cards",()=>{
  for(const heading of ["Still &amp; Near","One pause of thanks","Prayer cards","Pray the room","Write your own lament","Practice reflection"]){
    assert.ok(page.includes(heading),"Missing heading "+heading);
  }
  for(const id of ["dawn","harbour","path","garden","quiet","night"]){
    assert.ok(page.includes('id:"'+id+'"'),"Missing starter "+id);
  }
  for(const element of ["card-grid","featured-art","thank-button","room-next","room-back","compose-lament","save-lament","save-reflection","clear-all"]){
    assert.ok(page.includes('id="'+element+'"'),"Missing control "+element);
  }
  assert.ok(page.includes("<svg"),"Need artwork definition");
  assert.ok(page.includes("linearGradient"),"Need SVG gradients");
});
test("Never upload personal prayer contents or silently persist typing",()=>{
  assert.ok(page.includes("localStorage.setItem(KEY"),"Missing deliberate local-only persistence");
  assert.ok(page.includes('addEventListener("click"'),"Writes must be explicit clicks");
  assert.ok(page.includes('id="clear-all"'),"Need delete control");
  assert.ok(page.includes("confirm("),"Destructive actions need confirmation");
  assert.ok(!/<script\s+[^>]*src=/i.test(page),"Third-party JavaScript is prohibited");
  assert.ok(!/\bfetch\s*\(/.test(page),"No network API calls are needed");
  assert.ok(!/\bXMLHttpRequest\b/.test(page),"No network API calls");
  assert.ok(page.includes("Nothing in this editor saves automatically"));
});
test("Research includes sources, accuracy and necessary caveats",()=>{
  for(const source of ["practicingthewayarchives.org/pray/week-three","practicingthewayarchives.org/pray/week-four","practicingtheway.org/prayer","doi.org/10.1002/ejsp.674","hachette.com.au/tyler-staton"]){
    assert.ok(research.includes(source),"Missing source "+source);
  }
  assert.ok(page.includes("not proof that God has made a particular promise"));
  assert.ok(page.includes("No streaks"));
  assert.ok(page.includes("not encrypted"));
});
test("Prayer deck linked from JoshHub",()=>{
  for(const [label,file] of [["navigation",layout],["dashboard",dashboard],["faith life area",life],["search",search]]){
    assert.ok(file.includes("/prayer-deck.html"),"Missing "+label+" link");
  }
});
test("Standalone page has syntactically valid JavaScript",()=>{
 const matches=[...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
 assert.equal(matches.length,1);
 assert.doesNotThrow(()=>new Script(matches[0][1],{filename:"prayer-deck.html"}));
});