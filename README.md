# EVM Compiler

Compiles an AST (Abstract Syntax Tree) to Ethereum Virtual Machine bytecodes, WIP.

## Design

TBD

## Versions

- 0.0.1 First published version
- 0.0.2 Fix check datasize; fix  binary order evaluation; using geast@0.0.7
- 0.0.3 Process local variables, loop and conditional commands
- 0.0.4 Process break and continue commands

## To Do

- Management of local variables
- Call private, internal, external methods
- Compile for commands
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

TBD

## Contribution

Feel free to [file issues](https://github.com/ajlopez/evmcompiler) and submit
[pull requests](https://github.com/ajlopez/evmcompiler/pulls) — contributions are
welcome.

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `npm test` continues to pass.

