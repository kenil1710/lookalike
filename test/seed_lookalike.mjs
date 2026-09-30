/**
 * Seeds CANONICAL, DEMO and SAFELIST (addresses from deployments.json) with
 * real tokens, and writes docs/seed-evidence.json after every step and
 * docs/SEEDS.md at the end. Resumable: a step already recorded as done is
 * skipped on the next run.
 *
 *   caffeinate -dims node seed_lookalike.mjs      # ~15 min (DEMO waits for its windows)
 *   node seed_lookalike.mjs --report               # rewrite docs/SEEDS.md only
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { connect, fundOnStudio, accounts, argOf, sleep, returnedJson } from "./harness.mjs";

const dep = JSON.parse(readFileSync(new URL("../deployments.json", import.meta.url), "utf8"));
const A = { CANONICAL: dep.contracts.CANONICAL.address, DEMO: dep.contracts.DEMO.address, SAFELIST: dep.contracts.SAFELIST.address };
const X = "https://explorer-studio-dev.genlayer.com";
const SCOUT = {
  ethereum: "https://eth.blockscout.com", base: "https://base.blockscout.com", arbitrum: "https://arbitrum.blockscout.com",
  optimism: "https://explorer.optimism.io", polygon: "https://polygon.blockscout.com",
};
const evPath = new URL("../docs/seed-evidence.json", import.meta.url);
let ev = existsSync(evPath) ? JSON.parse(readFileSync(evPath, "utf8")) : null;
if (!ev || ev.contracts?.CANONICAL !== A.CANONICAL || ev.contracts?.DEMO !== A.DEMO || ev.contracts?.SAFELIST !== A.SAFELIST) {
  ev = { contracts: A, commit: dep.commit, steps: {} };
}
const save = () => writeFileSync(evPath, JSON.stringify(ev, null, 2) + "\n");

const USDC_ETH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const EXACT_ARB = "0x8Fd886c4021ed69a968f6966F818e476868B00eD";
const AXL_ARB = "0xEB466342C4d449BC9f53A865D5Cb90586f405215";
const SPARK_ETH = "0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE";
const DISGUISED_BRIDGED = "0xE3F520d5C6f5421eE02160242f7a9e025d829E3e";
const LATE_FAKE = "0x35E57438a1348e3441501d5F4ea892Bc81009511";

// id, method, args, expected, what the token is
const CANON = [
  ["C1", "flag", ["arbitrum", "0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D", "usd-coin"], "IMPERSONATOR/HOMOGLYPH", "on chain: 'USD Coin' / 'USDC' with Cyrillic ES and o plus invisible U+206B, U+FEFF, U+200B"],
  ["C2", "flag", ["arbitrum", "0xdaECe7e93993394063a01BB39145A7d71d4df8f1", "usd-coin"], "IMPERSONATOR/HOMOGLYPH", "'U+FEFF SD Coin' / 'U+FEFF SDC': byte-order mark inside"],
  ["C3", "flag", ["arbitrum", "0x72224ea851b18d56065E7ebe355a246A66F5ce2E", "usd-coin"], "IMPERSONATOR/HOMOGLYPH", "'USD Coin' / 'U U+206F SD U+200D C'"],
  ["C4", "flag", ["arbitrum", "0x2790AfA96A254142a13C24A7BE2C35afC784b82a", "tether"], "IMPERSONATOR/HOMOGLYPH", "'Tet U+FEFF her USD' / 'U U+200C SDT'"],
  ["C5", "flag", ["arbitrum", EXACT_ARB, "usd-coin"], "IMPERSONATOR/EXACT_COPY", "'USDC' / 'USDC', 6 decimals, not the official Arbitrum USDC"],
  ["C6", "flag", ["arbitrum", "0x413f1661a78A9675C95E33D63b0c90DBD747c43B", "tether"], "IMPERSONATOR/EXACT_COPY", "'USDT' / 'USDT' on Arbitrum (the official Tether there is USDT0)"],
  ["C7", "flag", ["ethereum", USDC_ETH, "usd-coin"], "OFFICIAL/OFFICIAL_LIST", "real USDC on Ethereum"],
  ["C8", "flag", ["arbitrum", "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", "usd-coin"], "VARIANT/LISTED_VARIANT", "real bridged USDC.e: on chain it says 'USD Coin (Arb1)' / 'USDC'; the list carries this address as USDC.e 'Bridged USDC'"],
  ["C9", "flag", ["arbitrum", AXL_ARB, "usd-coin"], "VARIANT/MODEL", "'Axelar Wrapped USDC' / 'axlUSDC', not on the list"],
  ["C10", "flag", ["ethereum", "0xdC035D45d973E3EC169d2276DDab16f1e407384F", "usd-coin"], "UNRELATED/NO_BRAND_MATCH", "Sky 'USDS Stablecoin' / 'USDS': a different dollar token"],
  ["C11", "flag_by_precedent", ["arbitrum", ["0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8", "0x1C1dEB401E94f4826260Ca888E53180819449714", "0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474", "0xCd5503c3718C2303Bf958538cF94FcB5606E4E01", "0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977"], "@C5"], "5 x IMPERSONATOR/PRECEDENT", "five more 'USDC' / 'USDC' / 6-decimal copies, byte-identical to C5"],
  ["C12", "flag", ["base", "0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1", "tether"], "refused: the official list does not cover this coin on this chain", "a 'Tether USD' copy on Base: the list has no Tether on Base, so the pair is refused"],
];

// MODEL cases on DEMO, each judged twice (flag now, recheck after the cooldown).
const MODEL_CASES = [
  ["M1", "arbitrum", AXL_ARB, "VARIANT/MODEL", "'Axelar Wrapped USDC' / 'axlUSDC'"],
  ["M2", "ethereum", SPARK_ETH, "UNRELATED/MODEL", "'Spark USDC Vault' / 'sUSDC'"],
  ["M3", "arbitrum", DISGUISED_BRIDGED, "IMPERSONATOR/MODEL", "real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters"],
];

const acc = accounts();
const base = connect({ address: A.CANONICAL });
await fundOnStudio(base.chain, acc.owner.address, 200n * 10n ** 18n);
await fundOnStudio(base.chain, acc.trigger.address, 50n * 10n ** 18n);
const at = {
  CANONICAL: connect({ address: A.CANONICAL }), DEMO: connect({ address: A.DEMO }),
  SAFELIST: connect({ address: A.SAFELIST }), PRUNER: connect({ address: A.SAFELIST, role: "trigger" }),
};
const addrOf = (inst) => (inst === "PRUNER" ? A.SAFELIST : A[inst]);

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
    id, instance: inst === "PRUNER" ? "SAFELIST" : inst, contract: addrOf(inst), signer: at[inst].account.address,
    method, args, expected, note,
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
const refusal = async (out) => ({ actual: out.reverted ? `refused: ${out.revertReason}` : "not refused" });
const waitUntil = async (epoch, why) => {
  for (;;) {
    const left = epoch - Math.floor(Date.now() / 1000);
    if (left <= 0) return;
    console.log(`  waiting ${left}s for ${why}`);
    await sleep(Math.min(left, 60) * 1000);
  }
};

if (!process.argv.includes("--report")) {
  // DEMO first: its clocks run while CANONICAL is seeded.
  const D1 = await step("D1", "DEMO", "flag", ["base", USDC_ETH, "usd-coin"], "PENDING", "the Ethereum USDC address on Base: no contract there (eth_getCode is empty), so the evidence fails", flagCheck("DEMO", "base", USDC_ETH, "usd-coin"));
  await step("D2", "DEMO", "rule", [D1.case_id], "PENDING", "anyone retries before the 5-minute deadline; still no contract", async () => ({ actual: (await caseOf("DEMO", "base", USDC_ETH, "usd-coin")).state }));
  const D3 = await step("D3", "DEMO", "flag", ["arbitrum", EXACT_ARB, "usd-coin"], "IMPERSONATOR/EXACT_COPY", "exact copy, to be rechecked", flagCheck("DEMO", "arbitrum", EXACT_ARB, "usd-coin"));
  await step("D4", "DEMO", "recheck", [D3.case_id], "refused: recheck cooldown has not passed", "recheck right away", refusal);
  for (const [id, chain, tok, expected, note] of MODEL_CASES) {
    await step(id, "DEMO", "flag", [chain, tok, "usd-coin"], expected, `${note}: model run 1`, flagCheck("DEMO", chain, tok, "usd-coin"));
  }

  for (const [id, method, args, expected, note] of CANON) {
    if (method === "flag" && expected.startsWith("refused")) {
      await step(id, "CANONICAL", method, args, expected, note, refusal);
    } else if (method === "flag") {
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
  await step("S3", "SAFELIST", "add_token", ["arbitrum", LATE_FAKE], "added", "a fake nobody has flagged yet (byte-identical to C3): the list has no reason to refuse it", async (out) => ({ actual: out.reverted ? `refused: ${out.revertReason}` : "added" }));
  await step("C13", "CANONICAL", "flag", ["arbitrum", LATE_FAKE, "usd-coin"], "IMPERSONATOR/HOMOGLYPH", "the same fake, flagged after it was listed", flagCheck("CANONICAL", "arbitrum", LATE_FAKE, "usd-coin"));
  await step("S4", "PRUNER", "prune", ["arbitrum", LATE_FAKE], "pruned", "a different account prunes it now that the register rules it an IMPERSONATOR", async (out) => ({ actual: out.reverted ? `refused: ${out.revertReason}` : "pruned" }));
  ev.safelist_tokens = JSON.parse(await at.SAFELIST.view("list_tokens", []));
  ev.safelist_pruned = JSON.parse(await at.SAFELIST.view("list_pruned", []));
  save();

  // DEMO time-based paths.
  const d3 = await caseOf("DEMO", "arbitrum", EXACT_ARB, "usd-coin");
  await waitUntil(d3.ruled_at + 180 + 20, "the DEMO recheck cooldown");
  await step("D5", "DEMO", "recheck", [D3.case_id], "IMPERSONATOR/EXACT_COPY", "after the 3-minute cooldown; history keeps the first ruling", async (out) => {
    const c = await caseOf("DEMO", "arbitrum", EXACT_ARB, "usd-coin");
    return { result: returnedJson(out), history: c.history, case: c, actual: `${c.state}/${c.basis}` };
  });
  for (const [id, chain, tok, expected, note] of MODEL_CASES) {
    const first = ev.steps[id];
    if (!first?.case_id) continue;
    const c0 = await caseOf("DEMO", chain, tok, "usd-coin");
    if (c0.ruled_at) await waitUntil(c0.ruled_at + 180 + 20, `the ${id} recheck cooldown`);
    await step(`${id}r`, "DEMO", "recheck", [first.case_id], expected, `${note}: model run 2 (recheck)`, async (out) => {
      const c = await caseOf("DEMO", chain, tok, "usd-coin");
      return { result: returnedJson(out), history: c.history, case: c, actual: `${c.state}/${c.basis}`, runs: c.history.map((h) => h.label) };
    });
  }
  const d1 = JSON.parse(await at.DEMO.view("get_case", [D1.case_id]));
  await waitUntil(d1.deadline + 20, "the DEMO rule window");
  await step("D6", "DEMO", "expire", [D1.case_id], "EXPIRED", "after the 5-minute rule window", async () => ({ actual: JSON.parse(await at.DEMO.view("get_case", [D1.case_id])).state }));
  await step("D7", "DEMO", "flag", ["base", USDC_ETH, "usd-coin"], "PENDING", "the same key flagged again after EXPIRED: a new case (still no contract at that address on Base)", async () => {
    const c = await caseOf("DEMO", "base", USDC_ETH, "usd-coin");
    return { case_id: c.case_id, previous_case_id: D1.case_id, case: c, actual: c.case_id !== D1.case_id ? c.state : "same case" };
  });
  ev.stats = { CANONICAL: JSON.parse(await at.CANONICAL.view("stats", [])), DEMO: JSON.parse(await at.DEMO.view("stats", [])) };
  save();
}

// --- docs/SEEDS.md ----------------------------------------------------------
const scout = (chain, t) => (SCOUT[chain] ? `[${t}](${SCOUT[chain]}/token/${t})` : `\`${t}\``);
const order = ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "S1", "S2", "S3", "C13", "S4",
  "D1", "D2", "D3", "D4", "D5", "D6", "D7", "M1", "M2", "M3", "M1r", "M2r", "M3r"];
const rows = order.filter((k) => ev.steps[k]).map((k) => {
  const s = ev.steps[k];
  const what = s.method === "flag" ? `flag ${s.args[0]} ${scout(s.args[0], s.args[1])} vs \`${s.args[2]}\``
    : s.method === "flag_by_precedent" ? `flag_by_precedent (precedent case ${s.precedent_case_id}): ${s.args[1].map((t) => scout("arbitrum", t)).join(", ")}`
    : s.method === "add_token" ? `Safelist.add_token ${s.args[0]} ${scout(s.args[0], s.args[1])}`
    : s.method === "prune" ? `Safelist.prune ${s.args[0]} ${scout(s.args[0], s.args[1])} (from ${s.signer})`
    : `${s.method}(case ${s.args[0]})`;
  const cid = s.case_id ? ` (case ${s.case_id})` : "";
  return `| ${k} | ${s.instance} | ${what}${cid} | ${s.note} | ${s.expected} | ${s.actual} | ${s.match ? "yes" : "**no**"} | [${s.tx}](${X}/tx/${s.tx}) |`;
});
const mism = order.filter((k) => ev.steps[k] && !ev.steps[k].match).map((k) => `- ${k}: expected ${ev.steps[k].expected}, got ${ev.steps[k].actual}. ${ev.steps[k].why ?? ""}`);
const d5 = ev.steps.D5;
const modelRows = ["M1", "M2", "M3"].filter((k) => ev.steps[k]).map((k) => `| ${k} (case ${ev.steps[k].case_id}) | ${ev.steps[k].note.replace(": model run 1", "")} | ${ev.steps[k].actual} | ${ev.steps[`${k}r`]?.actual ?? "not run"} |`);
writeFileSync(new URL("../docs/SEEDS.md", import.meta.url), `# Seeds (studio-dev)

Every row is a real transaction on real token data. Contracts: CANONICAL [\`${A.CANONICAL}\`](${X}/address/${A.CANONICAL}), DEMO [\`${A.DEMO}\`](${X}/address/${A.DEMO}), SAFELIST [\`${A.SAFELIST}\`](${X}/address/${A.SAFELIST}), deployed from commit \`${dep.commit}\`. Raw records (returned values, case JSON, history) are in [seed-evidence.json](seed-evidence.json). Token links go to each chain's explorer for people; the contract itself reads name, symbol and decimals with eth_call.

| Step | Instance | Call | Token | Expected | Actual | Match | Tx |
|---|---|---|---|---|---|---|---|
${rows.join("\n")}

${mism.length ? "## Did not match\n\n" + mism.join("\n") + "\n" : "All steps matched their expected outcome.\n"}
${modelRows.length ? `## MODEL cases judged twice (DEMO)\n\nEach was flagged (model run 1, all validators asked the model and agreed on one label) and rechecked after the cooldown (model run 2).\n\n| Case | Token | Run 1 | Run 2 |\n|---|---|---|---|\n${modelRows.join("\n")}\n` : ""}
${d5?.history ? `## Recheck history (DEMO case ${d5.args[0]})\n\n| # | Label | Basis | At (unix) | Evidence sha256 |\n|---|---|---|---|---|\n${d5.history.map((h, i) => `| ${i + 1} | ${h.label} | ${h.basis} | ${h.at} | \`${h.evidence_sha256}\` |`).join("\n")}\n\nThe first ruling is kept, not overwritten.\n` : ""}
${ev.safelist_tokens ? `## Safelist after S1-S4\n\nListed:\n\n\`\`\`json\n${JSON.stringify(ev.safelist_tokens, null, 2)}\n\`\`\`\n\nPruned:\n\n\`\`\`json\n${JSON.stringify(ev.safelist_pruned ?? [], null, 2)}\n\`\`\`\n` : ""}
${ev.stats ? `## Stats after seeding\n\n\`\`\`json\n${JSON.stringify(ev.stats, null, 2)}\n\`\`\`\n` : ""}`);
console.log("\nwrote docs/SEEDS.md");
