/**
 * Reads each deployed contract's source back off the chain
 * (`gen_getContractCode`) and compares it byte for byte with the file at a git
 * ref (default HEAD; `--ref=origin/main` after pushing).
 *
 *   node verify_source.mjs [--ref=origin/main]
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { studioDevnet } from "genlayer-js/chains";
import { argOf } from "./harness.mjs";

const root = new URL("../", import.meta.url);
const dep = JSON.parse(readFileSync(new URL("deployments.json", root), "utf8"));
const ref = argOf("ref", "HEAD");
const sha = (b) => createHash("sha256").update(b).digest("hex");

async function codeOf(address) {
  const res = await fetch(studioDevnet.rpcUrls.default.http[0], {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "gen_getContractCode", params: [address] }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return Buffer.from(String(json.result), "base64");
}

let failures = 0;
for (const [name, d] of Object.entries(dep.contracts)) {
  const atRef = execSync(`git show ${ref}:${d.file}`, { cwd: root });
  const onchain = await codeOf(d.address);
  const same = Buffer.compare(atRef, onchain) === 0 && sha(onchain) === d.source_sha256;
  if (!same) failures++;
  console.log(`${same ? "ok  " : "FAIL"} ${name.padEnd(9)} ${d.address} chain sha256 ${sha(onchain)} | ${ref}:${d.file} sha256 ${sha(atRef)}`);
}
console.log(failures === 0 ? `deployed source is byte-identical to ${ref}` : `${failures} mismatch(es)`);
process.exit(failures === 0 ? 0 : 1);
