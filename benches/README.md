## Bench
```bash
cd benches
python bench.py
```

The results generated from each benchmark contain a "kind" column with three components: `nts`, `ojs`, and `pts`.

- `nts`: normal TypeScript. This refers to the JavaScript code compiled by regular `tsc` (`optimizeWithTypes=false`) from the TypeScript port of the original JavaScript code

- `ojs`: Original JavaScript. This refers to the original JavaScript implementation code

- `pts`: Patched TypeScript: This refers to the original JavaScript code compiled by patched `tsc` (`optimizeWithTypes=true`) from the TypeScript port of the original JavaScript code


All tests are from the JetStream 2.1 test suite: https://browserbench.org/JetStream/in-depth.html