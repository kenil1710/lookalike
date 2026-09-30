# v0.3.0
# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }
import genlayer as gl
from genlayer import *
from dataclasses import dataclass
import json
import typing

# Safelist - a tiny on-chain token list (like a DEX default list) that asks
# the Lookalike register before it accepts a token.
#
# add_token reads Lookalike.is_impersonator for (chain, token) with a
# cross-contract view and refuses the token if the register rules it an
# IMPERSONATOR of any coin. The Lookalike address is fixed in the constructor.
# Only the curator (the deployer) adds tokens; a refusal changes nothing.
#
# A token can be ruled an impersonator AFTER it was listed. prune(chain,
# token) is open to anyone: it removes a listed token if, and only if, the
# register rules it an IMPERSONATOR now.


@gl.contract.interface
class ILookalike:
    """The one Lookalike method this list depends on."""

    class View:
        def is_impersonator(self, chain: str, token: str) -> bool:
            pass

    class Write:
        pass


@gl.storage.allow
@dataclass
class Entry:
    chain: str
    token: str
    added_at: str
    removed_at: str


class Safelist(gl.contract.Contract):
    register: Address
    curator: Address
    entries: gl.storage.DynArray[Entry]
    listed: gl.storage.TreeMap[str, bool]

    def __init__(self, lookalike_address: str):
        self.register = Address(str(lookalike_address))
        self.curator = gl.message.sender_address

    @gl.public.write
    def add_token(self, chain: str, token: str) -> str:
        if gl.message.sender_address != self.curator:
            raise gl.vm.UserError("curator only")
        t = str(token).strip().lower()
        key = str(chain) + "|" + t
        if self.listed.get(key, False):
            raise gl.vm.UserError("already listed")
        # Raises for an unknown chain or a malformed address, which reverts.
        if ILookalike(self.register).view().is_impersonator(chain, t):
            raise gl.vm.UserError("refused: Lookalike rules " + t + " on " + str(chain)
                                  + " an IMPERSONATOR")
        e = self.entries.append_new_get()
        e.chain = str(chain)
        e.token = t
        e.added_at = str(gl.message.raw.get("datetime", ""))
        e.removed_at = ""
        self.listed[key] = True
        return json.dumps({"added": True, "chain": str(chain), "token": t}, sort_keys=True)

    @gl.public.write
    def prune(self, chain: str, token: str) -> str:
        t = str(token).strip().lower()
        key = str(chain) + "|" + t
        if not self.listed.get(key, False):
            raise gl.vm.UserError("not listed")
        if not ILookalike(self.register).view().is_impersonator(chain, t):
            raise gl.vm.UserError("Lookalike does not rule " + t + " on " + str(chain)
                                  + " an IMPERSONATOR; nothing to prune")
        for e in self.entries:
            if str(e.chain) == str(chain) and str(e.token) == t and str(e.removed_at) == "":
                e.removed_at = str(gl.message.raw.get("datetime", ""))
        self.listed[key] = False
        return json.dumps({"pruned": True, "chain": str(chain), "token": t}, sort_keys=True)

    @gl.public.view
    def list_tokens(self) -> str:
        return json.dumps([{"chain": str(e.chain), "token": str(e.token), "added_at": str(e.added_at)}
                           for e in self.entries if str(e.removed_at) == ""], sort_keys=True)

    @gl.public.view
    def list_pruned(self) -> str:
        return json.dumps([{"chain": str(e.chain), "token": str(e.token), "added_at": str(e.added_at),
                            "removed_at": str(e.removed_at)}
                           for e in self.entries if str(e.removed_at) != ""], sort_keys=True)

    @gl.public.view
    def get_register(self) -> str:
        return self.register.as_hex
