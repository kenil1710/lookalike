/**
 * Seeds CANONICAL, DEMO and SAFELIST (addresses from deployments.json) with
 * real tokens, and writes docs/seed-evidence.json after every step and
 * docs/SEEDS.md at the end. Resumable: a step already recorded as done is
 * skipped on the next run.
 *
 *   caffeinate -dims node seed_lookalike.mjs            # ~15 min (DEMO waits for its windows)
 *   node seed_lookalike.mjs --report                     # rewrite docs/SEEDS.md only
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { connect, fundOnStudio, accounts, argOf, sleep, returnedJson } from "./harness.mjs";

const dep = JSON.parse(readFileSync(new URL("../deployments.json", import.meta.url), "utf8"));
const A = { CANONICAL: dep.contracts.CANONICAL.address, DEMO: dep.contracts.DEMO.address, SAFELIST: dep.contracts.SAFELIST.address };
const X = "https://explorer-studio-dev.genlayer.com";
const SCOUT = { ethereum: "https://eth.blockscout.com", base: "https://base.blockscout.com", arbitrum: "https://arbitrum.blockscout.com" };
const evPath = new URL("../docs/seed-evidence.json", import.meta.url);
const ev = existsSync(evPath) ? JSON.parse(readFileSync(evPath, "utf8")) : { contracts: A, steps: {} };
if (ev.contracts.CANONICAL !== A.CANONICAL || ev.contracts.DEMO !== A.DEMO) { ev.contracts = A; ev.steps = {}; }
const save = () => writeFileSync(evPath, JSON.stringify(ev, null, 2) + "\n");

const USDC_ETH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const EXACT_ARB = "0x8Fd886c4021ed69a968f6966F818e476868B00eD";

// id, instance, method, args, expected, what the token is
const CANON = [
  ["C1", "flag", ["arbitrum", "0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D", "usd-coin"], "IMPERSONATOR/HOMOGLYPH", "\"USD Coin\" / \"USDC\" with Cyrillic С and о plus invisible U+206B/U+FEFF/U+200B"],
  ["C2", "flag", ["arbitrum", "0xdaECe7e93993394063a01BB39145A7d71d4df8f1", "usd-coin"], "IMPERSONATOR/HOMOGLYPH", "\"U+FEFF SD Coin\" / \"U+FEFF SDC\": byte-order mark inside"],
  ["C3", "flag", ["arbitrum", "0x72224ea851b18d56065E7ebe355a246A66F5ce2E", "usd-coin"], "IMPERSONATOR/HOMOGLYPH", "\"USD Coin\" / \"U+206F SD U+200D C\""],
  ["C4", "flag", ["arbitrum", "0x2790AfA96A254142a13C24A7BE2C35afC784b82a", "tether"], "IMPERSONATOR/HOMOGLYPH", "\"Tet U+FEFF her USD\" / \"U U+200C SDT\""],
  ["C5", "flag", ["arbitrum", EXACT_ARB, "usd-coin"], "IMPERSONATOR/EXACT_COPY", "\"USDC\" / \"USDC\", 6 decimals, not the official Arbitrum USDC"],
  ["C6", "flag", ["base", "0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1", "tether"], "IMPERSONATOR/EXACT_COPY", "\"Tether USD\" / \"USDT\" on Base, 18 decimals"],
  ["C7", "flag", ["ethereum", USDC_ETH, "usd-coin"], "OFFICIAL/OFFICIAL_LIST", "real USDC on Ethereum"],
  ["C8", "flag", ["arbitrum", "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", "usd-coin"], "VARIANT/MODEL", "real bridged USDC.e on Arbitrum, \"Arbitrum Bridged USDC (Arbitrum)\" / \"USDC.E\""],
  ["C9", "flag", ["ethereum", "0xdC035D45d973E3EC169d2276DDab16f1e407384F", "usd-coin"], "UNRELATED/NO_BRAND_MATCH", "Sky \"USDS\" / \"USDS\": a different dollar token"],
  ["C10", "flag_by_precedent", ["arbitrum", ["0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8", "0x1C1dEB401E94f4826260Ca888E53180819449714", "0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474", "0xCd5503c3718C2303Bf958538cF94FcB5606E4E01", "0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977"], "@C5"], "5 x IMPERSONATOR/PRECEDENT", "five more \"USDC\" / \"USDC\" / 6-decimal copies, byte-identical to C5"],
];

const acc = accounts();
const base = connect({ address: A.CANONICAL });
await fundOnStudio(base.chain, acc.owner.address, 200n * 10n ** 18n);
const at = { CANONICAL: connect({ address: A.CANONICAL }), DEMO: connect({ address: A.DEMO }), SAFELIST: connect({ address: A.SAFELIST }) };

async function caseOf(inst, chain, token, coin) {
  const s = JSON.parse(await at[inst].view("get_status", [chain, token]));
  const row = s.cases.find((c) => c.coin === coin);
  return row ? JSON.parse(await at[inst].view("get_case", [row.case_id])) : null;
}

async function step(id, inst, method, args, expected, note, check) {
  if (ev.steps[id]?.done) { console.log(`${id} done already`); return ev.steps[id]; }
  console.log(`\n${id} ${inst}.${method}(${JSON.stringify(args)})  expect ${expected}`);
  const out = await at[inst].send(method, args);
  const rec = {
    id, instance: inst, contract: A[inst], method, args, expected, note,
    tx: out.hash, status: out.status, reverted: out.reverted, revert_reason: out.reverted ? out.revertReason : "",
    returned: out.reverted ? null : out.returned, seconds: Math.round(out.seconds), at: new Date().toISOString(),
  };
  Object.assign(rec, await check(out, rec));
  rec.done = out.status === "ACCEPTED" || out.status === "FINALIZED";
  rec.match = rec.actual === expected;
  ev.steps[id] = rec;
  save();
  console.log(`  -> ${rec.status} actual=${rec.actual} ${rec.match ? "MATCH" : "MISMATCH"} tx ${rec.tx} (${rec.seconds}s)`);
  return rec;
}

const flagCheck = (inst, chain, token, coin) => async () => {
  const c = await caseOf(inst, chain, token, coin);
  return { case_id: c?.case_id ?? null, actual: c ? (c.state === "PENDING" || c.state === "EXPIRED" ? c.state : `${c.state}/${c.basis}`) : "no case", case: c };
};

if (!argOf("report") && argOf("only") !== "report") {
  // DEMO first: its clocks run while CANONICAL is seeded.
  const D1 = await step("D1", "DEMO", "flag", ["base", USDC_ETH, "usd-coin"], "PENDING", "the Ethereum USDC address on Base: no token there, Blockscout answers 404, so the evidence fails", flagCheck("DEMO", "base", USDC_ETH, "usd-coin"));
  await step("D2", "DEMO", "rule", [D1.case_id], "PENDING", "anyone retries before the 5-minute deadline; still 404", async () => ({ actual: (await caseOf("DEMO", "base", USDC_ETH, "usd-coin")).state }));
  const D3 = await step("D3", "DEMO", "flag", ["arbitrum", EXACT_ARB, "usd-coin"], "IMPERSONATOR/EXACT_COPY", "exact copy, to be rechecked", flagCheck("DEMO", "arbitrum", EXACT_ARB, "usd-coin"));
  await step("D4", "DEMO", "recheck", [D3.case_id], "refused: recheck cooldown has not passed", "recheck right away", async (out) => ({ actual: out.reverted ? `refused: ${out.revertReason}` : "not refused" }));

  for (const [id, method, args, expected, note] of CANON) {
    if (method === "flag") {
      await step(id, "CANONICAL", method, args, expected, note, flagCheck("CANONICAL", ...args));
    } else {
      const pid = ev.steps[args[2].slice(1)].case_id;
      await step(id, "CANONICAL", method, [args[0], args[1], pid], expected, note, async (out) => {
        const r = returnedJson(out) ?? {};
        const states = [];
        for (const t of args[1]) {
          const c = await caseOf("CANONICAL", args[0], t, "usd-coin");
          states.push({ token: t, case_id: c?.case_id, state: c?.state, basis: c?.basis, root_case_id: c?.root_case_id });
        }
        const ok = states.filter((s) => s.state === "IMPERSONATOR" && s.basis === "PRECEDENT").length;
        return { precedent_case_id: pid, result: r, cases: states, actual: `${ok} x IMPERSONATOR/PRECEDENT` };
      });
    }
  }

  await step("S1", "SAFELIST", "add_token", ["ethereum", USDC_ETH], "added", "real USDC (CANONICAL case C7 is OFFICIAL)", async (out) => ({ actual: out.reverted ? `refused: ${out.revertReason}` : "added" }));
  await step("S2", "SAFELIST", "add_token", ["arbitrum", EXACT_ARB], "refused: IMPERSONATOR", "the C5 fake", async (out) => ({ actual: out.reverted && /IMPERSONATOR/.test(out.revertReason) ? "refused: IMPERSONATOR" : `not refused (${out.revertReason})` }));
  ev.safelist_tokens = JSON.parse(await at.SAFELIST.view("list_tokens", []));
  save();

  // DEMO time-based paths.
  const d3 = await caseOf("DEMO", "arbitrum", EXACT_ARB, "usd-coin");
  const waitUntil = async (epoch, why) => {
    for (;;) {
      const left = epoch - Math.floor(Date.now() / 1000);
      if (left <= 0) return;
      console.log(`  waiting ${left}s for ${why}`);
      await sleep(Math.min(left, 60) * 1000);
    }
  };
  await waitUntil(d3.ruled_at + 180 + 20, "the DEMO recheck cooldown");
  await step("D5", "DEMO", "recheck", [D3.case_id], "IMPERSONATOR/EXACT_COPY", "after the 3-minute cooldown; history keeps the first ruling", async (out) => {
    const c = await caseOf("DEMO", "arbitrum", EXACT_ARB, "usd-coin");
    return { result: returnedJson(out), history: c.history, case: c, actual: `${c.state}/${c.basis}` };
  });
  const d1 = JSON.parse(await at.DEMO.view("get_case", [D1.case_id]));
  await waitUntil(d1.deadline + 20, "the DEMO rule window");
  await step("D6", "DEMO", "expire", [D1.case_id], "EXPIRED", "after the 5-minute rule window", async () => ({ actual: JSON.parse(await at.DEMO.view("get_case", [D1.case_id])).state }));
  await step("D7", "DEMO", "flag", ["base", USDC_ETH, "usd-coin"], "PENDING", "the same key flagged again after EXPIRED: a new case (still no token at that address on Base)", async () => {
    const c = await caseOf("DEMO", "base", USDC_ETH, "usd-coin");
    return { case_id: c.case_id, previous_case_id: D1.case_id, case: c, actual: c.case_id !== D1.case_id ? c.state : "same case" };
  });
  ev.stats = { CANONICAL: JSON.parse(await at.CANONICAL.view("stats", [])), DEMO: JSON.parse(await at.DEMO.view("stats", [])) };
  save();
}

// --- docs/SEEDS.md ----------------------------------------------------------
const tokenOf = (s) => (s.method === "flag" ? s.args[1] : null);
const chainOf = (s) => (s.method === "flag" || s.method === "flag_by_precedent" || s.method === "add_token" ? s.args[0] : null);
const scout = (chain, t) => (SCOUT[chain] ? `[${t}](${SCOUT[chain]}/token/${t})` : `\`${t}\``);
const order = ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "S1", "S2", "D1", "D2", "D3", "D4", "D5", "D6", "D7"];
const rows = order.filter((k) => ev.steps[k]).map((k) => {
  const s = ev.steps[k];
  const what = s.method === "flag" ? `flag ${s.args[0]} ${scout(s.args[0], s.args[1])} vs \`${s.args[2]}\``
    : s.method === "flag_by_precedent" ? `flag_by_precedent (precedent case ${s.precedent_case_id}): ${s.args[1].map((t) => scout("arbitrum", t)).join(", ")}`
    : s.method === "add_token" ? `Safelist.add_token ${s.args[0]} ${scout(s.args[0], s.args[1])}`
    : `${s.method}(case ${s.args[0]})`;
  const cid = s.case_id ? ` (case ${s.case_id})` : "";
  return `| ${k} | ${s.instance} | ${what}${cid} | ${s.note} | ${s.expected} | ${s.actual} | ${s.match ? "yes" : "**no**"} | [${s.tx}](${X}/tx/${s.tx}) |`;
});
const mism = order.filter((k) => ev.steps[k] && !ev.steps[k].match).map((k) => `- ${k}: expected ${ev.steps[k].expected}, got ${ev.steps[k].actual}. ${ev.steps[k].why ?? ""}`);
const d5 = ev.steps.D5;
writeFileSync(new URL("../docs/SEEDS.md", import.meta.url), `# Seeds (studio-dev)

Every row is a real transaction on real token data. Contracts: CANONICAL [\`${A.CANONICAL}\`](${X}/address/${A.CANONICAL}), DEMO [\`${A.DEMO}\`](${X}/address/${A.DEMO}), SAFELIST [\`${A.SAFELIST}\`](${X}/address/${A.SAFELIST}). Raw records (returned values, case JSON, history) are in [seed-evidence.json](seed-evidence.json). Token links go to Blockscout.

| Step | Instance | Call | Token | Expected | Actual | Match | Tx |
|---|---|---|---|---|---|---|---|
${rows.join("\n")}

${mism.length ? "## Did not match\n\n" + mism.join("\n") + "\n" : "All steps matched their expected outcome.\n"}
${d5?.history ? `## Recheck history (DEMO case ${d5.args[0]})\n\n| # | Label | Basis | At (unix) | Evidence sha256 |\n|---|---|---|---|---|\n${d5.history.map((h, i) => `| ${i + 1} | ${h.label} | ${h.basis} | ${h.at} | \`${h.evidence_sha256}\` |`).join("\n")}\n\nThe token did not rename between the two rulings, so both entries agree; the first is kept, not overwritten.\n` : ""}
${ev.safelist_tokens ? `## Safelist contents after S1/S2\n\n\`\`\`json\n${JSON.stringify(ev.safelist_tokens, null, 2)}\n\`\`\`\n` : ""}
${ev.stats ? `## Stats after seeding\n\n\`\`\`json\n${JSON.stringify(ev.stats, null, 2)}\n\`\`\`\n` : ""}`);
console.log("\nwrote docs/SEEDS.md");
