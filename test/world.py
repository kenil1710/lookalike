"""Test world for Lookalike: fake JSON-RPC chains, a fake official list, a clock,
actors, and the register's bookkeeping invariants asserted after EVERY call.

Token names used here are copied from real impersonators found on Arbitrum,
Base and Ethereum (docs/SEEDS.md) or written to exercise one rule.
"""

import copy
import json
from pathlib import Path

import stub

stub._install_stub()

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "contracts" / "lookalike.py"
SAFELIST_SRC = ROOT / "contracts" / "safelist.py"
LK = stub.load_full(SRC, "lookalike_contract")
SL = stub.load_full(SAFELIST_SRC, "safelist_contract")

UserError = stub.UserError
LIST_URL = LK.LIST_URL


def addr(ch: str) -> str:
    return "0x" + ch * 40


DEPLOYER = "0x" + "0" * 39 + "1"
ALICE = addr("a")
BOB = addr("b")
CAROL = addr("c")
OUTSIDER = addr("9")

T0 = 1790683200           # 2026-09-29T12:00:00Z
HOUR = 3600

# Real official addresses (Uniswap default list).
USDC_ETH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
USDC_ARB = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
USDT_ETH = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
USDT0_ARB = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
WETH_ETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
DAI_ETH = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
WBTC_ETH = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
USDCE_ARB = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"

# Fakes (arbitrary addresses, names shaped like the real ones).
F1 = "0x" + "1" * 40
F2 = "0x" + "2" * 40
F3 = "0x" + "3" * 40
F4 = "0x" + "4" * 40
F5 = "0x" + "5" * 40
F6 = "0x" + "6" * 40
F7 = "0x" + "7" * 40

RPC_URL = {k: v[0] for k, v in LK.CHAIN_TABLE.items()}
CHAIN_ID = {k: v[1] for k, v in LK.CHAIN_TABLE.items()}


def iso(epoch: int) -> str:
    days, rem = divmod(int(epoch), 86400)
    z = days + 719468
    era = (z if z >= 0 else z - 146096) // 146097
    doe = z - era * 146097
    yoe = (doe - doe // 1460 + doe // 36524 - doe // 146096) // 365
    y = yoe + era * 400
    doy = doe - (365 * yoe + yoe // 4 - yoe // 100)
    mp = (5 * doy + 2) // 153
    d = doy - (153 * mp + 2) // 5 + 1
    m = mp + (3 if mp < 10 else -9)
    y += 1 if m <= 2 else 0
    h, rem = divmod(rem, 3600)
    mi, s = divmod(rem, 60)
    return "%04d-%02d-%02dT%02d:%02d:%02dZ" % (y, m, d, h, mi, s)


def default_list():
    rows = [
        (1, "USDC", USDC_ETH), (42161, "USDC", USDC_ARB), (8453, "USDC", USDC_BASE),
        (10, "USDC", "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"),
        (137, "USDC", "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"),
        (42161, "USDC.e", USDCE_ARB), (1, "USDT", USDT_ETH), (42161, "USDT0", USDT0_ARB),
        (10, "USDT", "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"),
        (137, "USDT", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"),
        (1, "WETH", WETH_ETH), (8453, "WETH", "0x4200000000000000000000000000000000000006"),
        (10, "WETH", "0x4200000000000000000000000000000000000006"),
        (42161, "WETH", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"),
        (137, "WETH", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"),
        (1, "DAI", DAI_ETH), (8453, "DAI", "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"),
        (42161, "DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"),
        (10, "DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"),
        (137, "DAI", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"),
        (1, "WBTC", WBTC_ETH), (42161, "WBTC", "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"),
        (10, "WBTC", "0x68f180fcCe6836688e9084f035309E29Bf0A2095"),
        (137, "WBTC", "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"),
    ]
    out = [{"chainId": c, "symbol": s, "address": a, "name": s, "decimals": 6} for c, s, a in rows]
    # padding: a real list has ~1700 entries; the contract refuses a list under 100
    out += [{"chainId": 999, "symbol": "PAD%d" % i, "address": "0x" + "%040x" % (i + 1), "name": "pad",
             "decimals": 18} for i in range(120)]
    return out


def abi_string(text):
    raw = text.encode("utf-8")
    n = len(raw)
    padded = raw + b"\x00" * ((32 - n % 32) % 32)
    return "0x" + (32).to_bytes(32, "big").hex() + n.to_bytes(32, "big").hex() + padded.hex()


def abi_bytes32(text):
    raw = text.encode("utf-8")[:32]
    return "0x" + (raw + b"\x00" * (32 - len(raw))).hex()


def abi_uint(v):
    return "0x" + int(v).to_bytes(32, "big").hex()


REVERT = {"code": 3, "message": "execution reverted"}


class Chain:
    """One chain's JSON-RPC endpoint as the validators see it."""

    def __init__(self, name):
        self.name = name
        self.tokens = {}         # lower address -> dict
        self.status = 200
        self.raw_body = None
        self.transport_error = set()   # tokens whose calls fail with a node error
        self.queue = []          # one-shot overrides: callable(body) -> (status, body)
        self.requests = 0

    def __call__(self, body):
        self.requests += 1
        if self.queue:
            return self.queue.pop(0)(body)
        if self.status != 200:
            return (self.status, "<html>bad gateway</html>")
        if self.raw_body is not None:
            return (200, self.raw_body)
        reqs = json.loads(body)
        return (200, json.dumps([self.answer(r) for r in reqs]))

    def answer(self, r):
        token = r["params"][0] if r["method"] == "eth_getCode" else r["params"][0]["to"]
        t = self.tokens.get(token.lower())
        if token.lower() in self.transport_error:
            return {"jsonrpc": "2.0", "id": r["id"], "error": {"code": -32603, "message": "upstream timeout"}}
        if r["method"] == "eth_getCode":
            return {"jsonrpc": "2.0", "id": r["id"], "result": "0x6080604052" if t else "0x"}
        if t is None:
            return {"jsonrpc": "2.0", "id": r["id"], "result": "0x"}
        data = r["params"][0]["data"]
        sel = data[:10]
        res = None
        if sel == LK.SEL_NAME and t["name"] is not None:
            res = abi_bytes32(t["name"]) if t["bytes32"] else abi_string(t["name"])
        elif sel == LK.SEL_SYMBOL and t["symbol"] is not None:
            res = abi_bytes32(t["symbol"]) if t["bytes32"] else abi_string(t["symbol"])
        elif sel == LK.SEL_DECIMALS and t["decimals"] is not None:
            res = abi_uint(t["decimals"])
        elif sel == LK.SEL_SUPPORTS:
            iface = data[10:18]
            if t["type"] == "ERC-721" and iface == LK.IFACE_ERC721:
                res = abi_uint(1)
            elif t["type"] == "ERC-1155" and iface == LK.IFACE_ERC1155:
                res = abi_uint(1)
            elif t["type"] in ("ERC-721", "ERC-1155"):
                res = abi_uint(0)
        if res is None:
            return {"jsonrpc": "2.0", "id": r["id"], "error": dict(REVERT)}
        return {"jsonrpc": "2.0", "id": r["id"], "result": res}


class Web:
    """The five chains and the official list, as the validators see them."""

    def __init__(self):
        self.chains = {c: Chain(c) for c in RPC_URL}
        for c, url in RPC_URL.items():
            stub.RPC[url] = self.chains[c]
        self.list_tokens = default_list()
        self.publish_list()

    def publish_list(self, body=None):
        if body is None:
            body = json.dumps({"name": "Uniswap Labs Default", "tokens": self.list_tokens})
        stub.WEB[LIST_URL] = (200, body)

    def token(self, chain, token, name, symbol, decimals="6", type_="ERC-20", bytes32=False):
        if type_ in ("ERC-721", "ERC-1155"):
            decimals = None
        self.chains[chain].transport_error.discard(token.lower())
        self.chains[chain].tokens[token.lower()] = {
            "name": name, "symbol": symbol, "type": type_, "bytes32": bytes32,
            "decimals": None if decimals is None else int(decimals)}

    def down_token(self, chain, token):
        self.chains[chain].transport_error.add(token.lower())

    def up_token(self, chain, token):
        self.chains[chain].transport_error.discard(token.lower())

    def down_rpc(self, chain, status=503):
        self.chains[chain].status = status

    def down_list(self):
        stub.WEB[LIST_URL] = (503, "<html>bad gateway</html>")


class World:
    def __init__(self, rule_window_s=6 * HOUR, recheck_cooldown_s=HOUR):
        stub.WEB.clear()
        stub.RPC.clear()
        stub.SEQ.clear()
        stub.CALLS.clear()
        stub.MODEL.reset()
        stub.LAST.clear()
        stub.CONTRACTS.clear()
        stub.FORGE["payload"] = None
        stub.FORGE["leader_dies"] = False
        stub.FORGE["mutate"] = None
        self.web = Web()
        self.t = T0
        self._as(DEPLOYER)
        self.c = LK.Lookalike(rule_window_s, recheck_cooldown_s)
        self.address = "0x" + "e" * 40
        stub.CONTRACTS[self.address] = self.c
        self.check()

    def _as(self, who):
        stub.MESSAGE.sender_address = stub._Addr(who)
        stub.MESSAGE.value = 0
        stub.MESSAGE.raw = {"datetime": iso(self.t)}

    def advance(self, seconds):
        self.t += int(seconds)
        stub.MESSAGE.raw = {"datetime": iso(self.t)}

    def call(self, who, method, *args):
        self._as(who)
        out = getattr(self.c, method)(*args)
        self.check()
        return out

    def view(self, method, *args):
        self._as(OUTSIDER)
        return getattr(self.c, method)(*args)

    def case(self, cid):
        return json.loads(self.view("get_case", cid))

    def snapshot(self):
        c = self.c
        return copy.deepcopy({
            "cases": [dict(vars(x)) for x in c.cases],
            "current": dict(c.current), "counts": dict(c.counts),
            "totals": (int(c.total_rechecks), int(c.total_precedent), int(c.total_model_rulings)),
            "config": c.config, "w": int(c.rule_window_s), "r": int(c.recheck_cooldown_s),
        })

    def check(self):
        """Invariants after every call: counts match reality, the index points
        at the newest case for each key, only EXPIRED cases were superseded."""
        c = self.c
        by_state = {}
        for x in c.cases:
            by_state[str(x.state)] = by_state.get(str(x.state), 0) + 1
            assert str(x.state) in LK.STATES, x.state
        for s in LK.STATES:
            assert int(c.counts.get(s, 0) or 0) == by_state.get(s, 0), ("count", s)
        latest = {}
        for x in c.cases:
            k = LK.case_key(str(x.chain), str(x.token), str(x.coin))
            if k in latest:
                assert str(c.cases[latest[k] - 1].state) == "EXPIRED", "superseded a live case"
            latest[k] = int(x.case_id)
        assert dict(c.current) == latest, "index is not the newest case per key"
        for x in c.cases:
            if str(x.state) in LK.RULED:
                assert int(x.ruled_at) > 0 and str(x.basis) and str(x.evidence)
                assert len(json.loads(str(x.history))) >= 1
            if str(x.basis) == "PRECEDENT":
                assert int(x.root_id) > 0

    # --- shortcuts
    def flag(self, chain, token, coin, who=ALICE):
        return self.call(who, "flag", chain, token, coin)

    def state(self, cid):
        return str(self.c.cases[int(cid) - 1].state)

    def basis(self, cid):
        return str(self.c.cases[int(cid) - 1].basis)


class Safelist:
    def __init__(self, world, curator=DEPLOYER):
        self.w = world
        world._as(curator)
        self.c = SL.Safelist(world.address)
        self.curator = curator

    def add(self, chain, token, who=None):
        self.w._as(who or self.curator)
        return self.c.add_token(chain, token)

    def tokens(self):
        return json.loads(self.c.list_tokens())
