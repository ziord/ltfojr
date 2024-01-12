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
# Release for release builds or Debug for debug builds
chmod +x setup.sh && ./setup.sh Release
```

## Benchmarks
Run benchmark programs using Python:

```
python3 bench.py

# or for help:
python3 bench.py -h 
```