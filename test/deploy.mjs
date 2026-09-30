/**
 * Deploys Lookalike twice (CANONICAL and DEMO: same bytes, only the two
 * constructor windows differ) and Safelist once, pointing at CANONICAL.
 *
 * Deploys ONLY from the committed HEAD: refuses if contracts/ differs from
 * `git show HEAD:<file>`, so the deployed bytes are the pushed bytes. Writes
 * deployments.json and ADDRESSES.md after each deploy.
 *
 *   node deploy.mjs [--network=studio-dev] [--keystore=<name>] [--only=CANONICAL,DEMO,SAFELIST]
 *
 * Without --keystore the `owner` key from test/.accounts.json signs. With
 * --keystore=<name>, ~/.genlayer/keystores/<name>.json is unlocked with
 * GENLAYER_KEYSTORE_PASSWORD from the environment (never printed, never stored).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash, createDecipheriv, scryptSync } from "node:crypto";
import { execSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { createClient, createAccount } from "genlayer-js";
import { keccak256 } from "viem";
import { CHAINS, argOf, accounts, fundOnStudio, deploy, gen } from "./harness.mjs";

const network = argOf("network", "studio-dev").replace("studio-dev", "studiodev");
const chain = CHAINS[network];
if (!chain) throw new Error(`unknown --network=${network}`);
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const root = new URL("../", import.meta.url);
const git = (cmd) => execSync(`git ${cmd}`, { cwd: root, encoding: "buffer" });

function unlockKeystore(name, password) {
  const path = join(homedir(), ".genlayer", "keystores", `${name}.json`);
  const store = JSON.parse(readFileSync(path, "utf8"));
  const c = store.Crypto ?? store.crypto;
  if (!c || c.kdf !== "scrypt") throw new Error(`${path}: unsupported keystore`);
  const { salt, n, r, p, dklen } = c.kdfparams;
  const derived = scryptSync(Buffer.from(password), Buffer.from(salt, "hex"), dklen, { N: n, r, p, maxmem: 256 * n * r });
  const ciphertext = Buffer.from(c.ciphertext, "hex");
  const mac = keccak256(Buffer.concat([derived.subarray(16, 32), ciphertext])).slice(2);
  if (mac !== c.mac.toLowerCase()) throw new Error("keystore MAC mismatch: wrong GENLAYER_KEYSTORE_PASSWORD");
  const d = createDecipheriv(c.cipher, derived.subarray(0, 16), Buffer.from(c.cipherparams.iv, "hex"));
  return `0x${Buffer.concat([d.update(ciphertext), d.final()]).toString("hex")}`;
}

const ks = argOf("keystore");
let key;
if (ks) {
  if (!process.env.GENLAYER_KEYSTORE_PASSWORD) throw new Error(`--keystore=${ks} needs GENLAYER_KEYSTORE_PASSWORD`);
  key = unlockKeystore(ks, process.env.GENLAYER_KEYSTORE_PASSWORD);
} else {
  key = accounts().owner.key;
}
const account = createAccount(key);
const wallet = createClient({ chain, account });
const read = createClient({ chain });

// --- the bytes: working tree must equal HEAD --------------------------------
const commit = git("rev-parse HEAD").toString().trim();
const FILES = { lookalike: "contracts/lookalike.py", safelist: "contracts/safelist.py" };
const code = {};
for (const [k, f] of Object.entries(FILES)) {
  const disk = readFileSync(new URL(f, root));
  const head = git(`show HEAD:${f}`);
  if (!disk.equals(head)) throw new Error(`${f} differs from HEAD ${commit}; commit first`);
  code[k] = head;
}
console.log(`commit ${commit}`);
console.log(`lookalike.py ${code.lookalike.length} bytes sha256 ${sha256(code.lookalike)}`);
console.log(`safelist.py  ${code.safelist.length} bytes sha256 ${sha256(code.safelist)}`);

await fundOnStudio(chain, account.address, 1000n * 10n ** 18n);
console.log(`signer ${account.address} (${ks ? `keystore ${ks}` : "test/.accounts.json owner"}) balance ${gen(await read.getBalance({ address: account.address }))} GEN`);

const path = new URL("../deployments.json", import.meta.url);
const doc = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
doc.network = "studio-dev";
doc.chain_id = chain.id;
doc.rpc = chain.rpcUrls.default.http[0];
doc.explorer = "https://explorer-studio-dev.genlayer.com/";
doc.commit = commit;
doc.contracts = doc.contracts ?? {};

const VARIANTS = {
  CANONICAL: { file: "lookalike", args: [21600, 3600], label: "canonical register: rule window 6 h, recheck cooldown 1 h" },
  DEMO: { file: "lookalike", args: [300, 180], label: "demo register (time-based paths): rule window 5 min, recheck cooldown 3 min" },
  SAFELIST: { file: "safelist", args: null, label: "consumer token list, reads CANONICAL" },
};
const only = argOf("only");
for (const name of only ? only.split(",") : Object.keys(VARIANTS)) {
  const v = VARIANTS[name];
  const args = v.args ?? [doc.contracts.CANONICAL?.address];
  if (args.some((a) => a === undefined)) throw new Error(`${name} needs CANONICAL deployed first`);
  console.log(`\n${name}: ${v.label}  args ${JSON.stringify(args)}`);
  const res = await deploy({ chain, wallet, read, code: code[v.file], args, label: `${name} deploy` });
  if (!res.ok) {
    console.error(`${name} FAILED ${res.out?.status} ${res.reason ?? ""} ${res.out?.revertReason ?? ""}\n${(res.out?.stderr ?? "").slice(-3000)}`);
    process.exit(1);
  }
  console.log(`  address ${res.address}`);
  doc.contracts[name] = {
    address: res.address, deploy_tx: res.hash, file: FILES[v.file], label: v.label,
    constructor_args: args.map(String), source_bytes: code[v.file].length, source_sha256: sha256(code[v.file]),
    commit, deployer: account.address, deployed_at: new Date().toISOString(),
  };
  writeFileSync(path, JSON.stringify(doc, null, 2) + "\n");
}

const X = doc.explorer.replace(/\/$/, "");
const c = doc.contracts;
const row = (n) => c[n] ? `| ${n} | \`${c[n].address}\` | ${c[n].file} | ${c[n].constructor_args.join(", ")} | [contract](${X}/address/${c[n].address}) · [deploy tx](${X}/tx/${c[n].deploy_tx}) |` : `| ${n} | not deployed | | | |`;
writeFileSync(new URL("../ADDRESSES.md", import.meta.url), `# Addresses (GenLayer studio-dev, chain ${chain.id})

RPC ${doc.rpc} · explorer ${doc.explorer}

| Instance | Address | File | Constructor args | Links |
|---|---|---|---|---|
${row("CANONICAL")}
${row("DEMO")}
${row("SAFELIST")}

- CANONICAL: \`rule_window_s = 21600\` (6 h), \`recheck_cooldown_s = 3600\` (1 h). All real-token rulings and the Safelist live here.
- DEMO: \`rule_window_s = 300\` (5 min), \`recheck_cooldown_s = 180\` (3 min). Same file, same bytes; used for the time-based paths (expire, re-flag, recheck).
- SAFELIST: constructor argument is the CANONICAL address.

Deployed from commit \`${commit}\`.

| File | Bytes | sha256 |
|---|---|---|
| contracts/lookalike.py (CANONICAL and DEMO) | ${code.lookalike.length} | \`${sha256(code.lookalike)}\` |
| contracts/safelist.py | ${code.safelist.length} | \`${sha256(code.safelist)}\` |

Check: \`git show ${commit}:contracts/lookalike.py | shasum -a 256\`.
`);
console.log("\nwrote deployments.json and ADDRESSES.md");
