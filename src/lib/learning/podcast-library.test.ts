import {describe,it,expect} from "vitest";
import {podcasts,spotifyEmbed} from "./podcast-library";

describe("Restored JoshHub podcast learning library",()=>{
 it("preserves 20 canonical research references and two Repair Café publisher MP3s",()=>{
  expect(podcasts).toHaveLength(22);
  expect(podcasts.filter(p=>p.player==="mp3")).toHaveLength(2);
  expect(new Set(podcasts.map(p=>p.id)).size).toBe(podcasts.length);
 });
 it("links every entry to a source and an appropriate in-page playback type",()=>{
  for(const p of podcasts){
   expect(p.url.startsWith("https://")).toBe(true);
   if(p.player==="mp3")expect(p.audio.startsWith("https://media.blubrry.com/therestartproject/")).toBe(true);
   if(p.player==="spotify")expect(spotifyEmbed(p.url)?.startsWith("https://open.spotify.com/embed/")).toBe(true);
   expect(p.question.length).toBeGreaterThan(20);
  }
 });
 it("supports Spotify shows as well as individual episodes",()=>{
  expect(spotifyEmbed("https://open.spotify.com/show/2m7vWs5BoO9s1iU1HdsOcc")).toBe("https://open.spotify.com/embed/show/2m7vWs5BoO9s1iU1HdsOcc");
  expect(spotifyEmbed("https://open.spotify.com/episode/6WyTlDuqgcYpBieTiEsdB2")).toBe("https://open.spotify.com/embed/episode/6WyTlDuqgcYpBieTiEsdB2");
 });
 it("doesn't turn untrusted URLs into iframe content",()=>{
  expect(spotifyEmbed("javascript:alert(1)")).toBeNull();
  expect(spotifyEmbed("https://example.org/show/test")).toBeNull();
 });
});
