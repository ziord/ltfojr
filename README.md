## LTFOJR Artifacts

### Deps
- python3 (assumed pre-installed)
- hyperfine
- zig
- tsc
- webkit
- bun

## Installation

If not on debian linux or macOs, install hyperfine: https://github.com/sharkdp/hyperfine.
Other dependencies such as Zig & WebKit are auto-installed (although this has only been tested on macOs).

Complete installation by running:
```bash
# 'Release' for release builds or 'Debug' for debug builds
chmod +x setup.sh && ./setup.sh Debug
```
**NOTE**: When running this command for the first time, please run the debug build. Future runs can use the release build.

## Benchmarks
Run benchmark programs using Python:

```
cd benches
python3 bench.py 

# or for help:
cd benches
python3 bench.py -h 
```