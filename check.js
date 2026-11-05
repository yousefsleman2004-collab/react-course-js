// Automatic check for homework 1. Do not change this file.
// Run: node check.js

import { existsSync, readFileSync } from "node:fs";
import { inspect, isDeepStrictEqual } from "node:util";
import { loadData } from "./load.js";
import * as service from "./series-service.js";
import * as buggy from "./buggy-utils.js";

const show = (series, id) => series.find(s => s.id === id);
const print = value => inspect(value, { depth: 5, breakLength: Infinity });

let passed = 0;
let total = 0;

const check = (label, module, name, run, expected) => {
  total++;
  if (typeof module[name] !== "function") {
    console.log(`⬜${label}${name} — not found (is it exported?)`);
    return;
  }
  const data = loadData();
  const before = JSON.stringify(data);
  let actual;
  try {
    actual = run(data.series, module[name]);
  } catch (error) {
    console.log(`❌${label}${name} — crashed:${error.message}`);
    return;
  }
  if (JSON.stringify(data) !== before) {
    console.log(`❌${label}${name} — changed the original data`);
    return;
  }
  if (!isDeepStrictEqual(actual, expected)) {
    console.log(`❌${label}${name}`);
    console.log(`     expected:${print(expected)}`);
    console.log(`     actual:${print(actual)}`);
    return;
  }
  passed++;
  console.log(`✅${label}${name}`);
};

console.log("--- Part A: access ---");

check("A1", service, "getEpisodeTitle", (s, f) => [f(show(s, 3), 0, 2), f(show(s, 1), 1, 0)], [
  "Zero Day",
  "Return",
]);
check("A2", service, "getLastSeasonNumber", (s, f) => [f(show(s, 3)), f(show(s, 5))], [3, 0]);
check("A3", service, "getNextSeasonYear", (s, f) => [f(show(s, 2)), f(show(s, 1))], [
  2027,
  "No announcement",
]);

console.log("--- Part B: array functions ---");

check("B1", service, "getById", (s, f) => [f(s, 4)?.title, f(s, 99)], ["The Last Library", undefined]);
check("B2", service, "getSeasonsCount", (s, f) => f(s), [
  { title: "Haifa Nights", seasons: 2 },
  { title: "Space Kitchen", seasons: 1 },
  { title: "Code Red", seasons: 3 },
  { title: "The Last Library", seasons: 1 },
  { title: "Desert Signal", seasons: 0 },
]);
check("B3", service, "hasTopEpisode", (s, f) => [f(show(s, 3), 9), f(show(s, 2), 9), f(show(s, 5), 9)], [
  true,
  false,
  false,
]);
check("B4", service, "getCreatorsFrom", (s, f) => [f(s, "Israel"), f(s, "France")], [
  ["Maya Levi", "Noam Shalev"],
  [],
]);
check("B5", service, "sortByStartYear", (s, f) => f(s).map(x => x.startYear), [2019, 2020, 2021, 2023, 2027]);

console.log("--- Part C: updates without changing the original ---");

check("C1", service, "renameSeries", (s, f) => {
  const result = f(s, 2, "Space Kitchen: Orbit");
  return [show(result, 2).title, show(result, 1) === show(s, 1)];
}, ["Space Kitchen: Orbit", true]);
check("C2", service, "addSeason", (s, f) => {
  const season = { number: 1, episodes: [{ id: 801, title: "First Contact", rating: 8, duration: 44 }] };
  const result = f(s, 5, season);
  return [show(result, 5).seasons.length, show(result, 5).seasons[0].episodes[0].title];
}, [1, "First Contact"]);
check("C3", service, "addEpisode", (s, f) => {
  const episode = { id: 303, title: "Comet Cake", rating: 8.1, duration: 26 };
  const result = f(s, 2, 1, episode);
  return [show(result, 2).seasons[0].episodes.map(e => e.id), show(result, 3) === show(s, 3)];
}, [[301, 302, 303], true]);

total++;
if (!existsSync("series-updated.json")) {
  console.log("⬜ C4 series-updated.json — file not found (run node save-updated.js)");
} else {
  try {
    const saved = JSON.parse(readFileSync("series-updated.json", "utf-8"));
    const ok =
      saved.platform === "SeriesHub" &&
      saved.series?.length === 5 &&
      show(saved.series, 5)?.seasons[0]?.episodes[0]?.title === "First Contact" &&
      loadData().series[4].seasons.length === 0;
    if (ok) {
      passed++;
      console.log("✅ C4 series-updated.json");
    } else {
      console.log("❌ C4 series-updated.json — the content is not as required");
    }
  } catch (error) {
    console.log(`❌ C4 series-updated.json — not valid JSON:${error.message}`);
  }
}

console.log("--- Part D: bug fixes ---");

check("D1", buggy, "getDramas", (s, f) => f(s).map(x => x.title), ["Haifa Nights", "The Last Library"]);
check("D2", buggy, "getEpisodeById", (s, f) => f(show(s, 1).seasons[0], "102")?.title, "Old Friends");
check("D3", buggy, "addEpisodeToFirstSeason", (s, f) => {
  const episode = { id: 703, title: "Ink", rating: 8.7, duration: 41 };
  return f(show(s, 4), episode).seasons[0].episodes.length;
}, 3);

console.log("------------------------------");
console.log(`Passed:${passed} /${total}`);