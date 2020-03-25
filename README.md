# EVM Compiler

Compiles an AST (Abstract Syntax Tree) to Ethereum Virtual Machine bytecodes, WIP.

## Design

TBD

## Versions

- 0.0.1 First published version
- 0.0.2 Fix check datasize; fix  binary order evaluation; using geast@0.0.7
- 0.0.3 Process local variables, loop and conditional commands
- 0.0.4 Process break and continue commands
- 0.0.5 For command, fnhash in API, stop in void method, local variables management first implementation
- 0.0.6 Array variable declaration and access, signed mod and div, process call, context redesign, logical operations, addmod mulmod operations

## To Do

- Management of local variables (partial)
- Call private, internal, external methods
- Pass arguments in stack when needed
- Returns result in stack when needed
- Contract inheritance
- String support
- Mapping support
- Dynamic arrays support
- Static array support
- Call another contract
- Transfer value to another address
- Pure, view methods
- Generate ABI

## References

- [Introducing Elle: A formally-verified EVM compiler to write more secure Ethereum code](https://media.consensys.net/introducing-elle-a-formally-verified-evm-compiler-to-write-more-secure-ethereum-code-90d1038e1886)
- [Mythril: Security analysis tool for EVM bytecode](https://github.com/ConsenSys/mythril)
- [K Semantics of the Ethereum Virtual Machine (EVM)](https://github.com/kframework/evm-semantics)
- [KVyper: Semantics of Vyper in K](https://github.com/kframework/vyper-semantics)
- [Solidity optimizing storage](https://github.com/Uniswap/uniswap-v2-core/pull/59)

## Contribution

Feel free to [file issues](https://github.com/ajlopez/evmcompiler) and submit
[pull requests](https://github.com/ajlopez/evmcompiler/pulls) — contributions are
welcome.

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `npm test` continues to pass.

