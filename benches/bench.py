import os
import re
import csv
import argparse
import subprocess
import datetime

# pick a root folder with name which describes the programs in it
# for each subfolder, pick the js program. Map the folder name to the js program.
# save all js files found full path included, with location for reporting
# bench with hyperfine, save the results for reporting.

# program name
# program kind:
#   nts (from normal ts transcription) 
#   pts (from patched ts transcription) 
#   ojs (from the original js program) 
# location: path to the program
# time: time taken

class Time:
    def __init__(self, top: float, bottom: float, outliers=False) -> None:
        self.top = top
        self.bottom = bottom
        self.outliers = outliers

class Program:
    def __init__(self, name: str, kind: str, location: str) -> None:
        self.name = name
        self.kind = kind
        self.location = location
        self.time: Time = Time(0, 0)
        self.range: Time = Time(0, 0)

    def __str__(self) -> str:
        return f"program: {self.name}, kind: {self.kind}, loc: {self.location}, time: {self.time}, range: {self.range}"
    
    def __repr__(self) -> str:
        return str(self)

class AuxInfo:
    def __init__(self) -> None:
        self.infos: dict[str, Time] = {}
        self.fastest = None
    
    def add(self, name: str, time: Time):
        self.infos[name] = time

    def has(self, name: str) -> Time:
        return name in self.infos
            
    def get(self, name: str) -> Time:
        return self.infos[name]

bench_info: dict[str, list[Program]] = {}
aux_bench_info: dict[str, AuxInfo] = {}
bun_path = os.path.join(os.path.dirname(__file__), "bun.txt")
BUN: str
with open(bun_path) as f:
    BUN = f.read().strip()


def select_js_files(_root: str, skip: str):
    for root, _, files in os.walk(_root):
        if files:
            if skip and root.endswith(skip):
                continue
            file = list(filter(lambda x: x.endswith('.js'), files))[0]
            tst_name = os.path.basename((tmp := os.path.split(root))[0])
            kind = tmp[1]
            location = os.path.join(root, file)
            if bench_info.get(tst_name) is None:
                bench_info[tst_name] = []
                aux_bench_info[tst_name] = AuxInfo()
            bench_info[tst_name].append(Program(tst_name, kind, location))

# def get_program_id(path: str) -> str:
#     return path.split(os.path.sep)[-1].split('.')[0]

def save_bench_output(stdout_result: str, stderr_result: str, tst_name: str):
    """
    benchmark is of the form:

    Benchmark 1: .../bun/build-release/bun n-body/nts/n-body.js
    Time (mean ± σ):      48.3 ms ±   1.4 ms    [User: 44.8 ms, System: 3.9 ms]
    Range (min … max):    46.6 ms …  53.1 ms    57 runs
    
    ...
    
    Summary
      .../bun/build-release/bun n-body/pts/n-body.js ran
        1.03 ± 0.08 times faster than .../bun/build-release/bun n-body/ojs/n-body.js
        1.05 ± 0.08 times faster than .../bun/build-release/bun n-body/nts/n-body.js
    """
    pattern_time = r'(\d+\.\d+)\s+ms\s*±\s*(\d+\.\d+)\s*ms'
    pattern_range = r'(\d+\.\d+)\s*ms\s*…\s*(\d+\.\d+)\s*ms'
    pattern_time2 = r'(\d+\.\d+)\s*±\s*(\d+\.\d+)'
    lines = stdout_result.splitlines()
    outliers = stderr_result.strip().startswith("Warning: Statistical outliers")
    for i, line in enumerate(lines):
        if line.startswith("Benchmark"):
            location = line.split()[-1]
            match = re.search(pattern_time, lines[i + 1])
            mean_time = (match.group(1))
            sigma_time = (match.group(2))
            match = re.search(pattern_range, lines[i + 2])
            min_time = (match.group(1))
            max_time = (match.group(2))
            progs = bench_info[tst_name]
            for prog in progs:
                if prog.location == location: #prog.time.top == 0 and prog.time.bottom == 0:
                    prog.time = Time(mean_time, sigma_time, outliers)
                    prog.range = Time(min_time, max_time, outliers)
                    break
        elif line.startswith("Summary"):
            # first
            fastest = lines[i + 1].split()[-2] # location
            aux_bench_info[tst_name].add(fastest, Time(1, 0))
            aux_bench_info[tst_name].fastest = fastest
            # second
            match = re.search(pattern_time2, lines[i + 2].strip())
            mean_time_1 = (match.group(1))
            sigma_time_1 = (match.group(2))
            aux_bench_info[tst_name].add(lines[i + 2].split()[-1], Time(mean_time_1, sigma_time_1))
            # third
            if i + 3 < len(lines):
                match = re.search(pattern_time2, lines[i + 3].strip())
                mean_time_2 = (match.group(1))
                sigma_time_2 = (match.group(2))
                aux_bench_info[tst_name].add(lines[i + 3].split()[-1], Time(mean_time_2, sigma_time_2))


def run_benchmark(directory: str, warmup: int, skip: str, fn: str, runs: int):
    select_js_files(directory, skip)
    for name, p in bench_info.items():
        filename = os.path.join(os.path.dirname(fn), name) + ".json"
        command = f"hyperfine "
        for prog in p:
            command += f"'{BUN} {prog.location}' "
        command += f"--warmup {warmup} --runs {runs} --export-json \"{filename}\""
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout_output = result.stdout
        stderr_output = result.stderr
        save_bench_output(stdout_output, stderr_output, name)


def get_filenames(filename: str = None):
    if filename:
        split = filename.split('.')
        return filename, split[0] + "-all" + split[-1]
    else:
        _dir = os.path.join(os.path.dirname(__file__), "_results")
        if not os.path.exists(_dir):
            os.mkdir(_dir)
        dt = datetime.datetime.now().strftime("%Y-%m-%d-%H:%M:%S")
        new_dir = f'{_dir}/{dt}'
        os.mkdir(new_dir)
        return f'{new_dir}/_nts-pts.csv', f'{new_dir}/_all.csv'


def write_results(filename: str):
    # bench info csv
    # program,  kind/type,  time, error,  min-time, max-time, relative-min-time, relative-max-time, fastest,     outliers
    #   n-body   pts         ..     ..         ..       ..          0                                 false/true  false/true
    outliers = []
    with open(filename, 'w') as file:
        csv_writer = csv.writer(file)
        csv_writer.writerow(
            ["program", "kind/type", "time", "error", "min time", "max time", "relative min time",]
        )
        for tst_name, programs in bench_info.items():
            aux_info = aux_bench_info[tst_name]
            rows = []
            for _, prog in enumerate(programs):
                # if not aux_info.has(prog.location): continue
                relative_time = aux_info.get(prog.location)
                if prog.time.outliers:
                    outliers.append(prog.name)
                row = [
                    tst_name, prog.kind, prog.time.top, prog.time.bottom,
                    prog.range.top, prog.range.bottom,
                    f"{relative_time.top} ± {relative_time.bottom}"
                ]
                rows.append(row)
            csv_writer.writerows(rows)
    print("Done.")
    if outliers:
        print("Some outliers were detected in the following runs:")
        for outlier in set(outliers):
            print(f"  {outlier}")
        print("Results may have been affected. Consider rerunning the benchmark.")
    print("Results written to", filename)
    bench_info.clear()
    aux_bench_info.clear()


def run_all_benches(start: str, warmup: int, prompt: str, skip: str, fn: str, runs: int):
    print(f"=={prompt}==")
    print("Benchmark process started")
    dirs = None
    for _root, _dirs, _ in os.walk(start):
        dirs = list(map(lambda d: os.path.join(_root, d), _dirs))
        break
    for _dir in dirs:
        if _dir.startswith('_') or _dir.startswith('.'): continue
        print("Exploring:", os.path.basename(_dir))
        run_benchmark(_dir, warmup, skip, fn, runs)


def main():
    parser = argparse.ArgumentParser(description='A simple benchmarking script')
    parser.add_argument('-d', '--directory', help='directory containing all benchmark programs', default=os.path.join(os.path.dirname(__file__), 'tests'))
    parser.add_argument('-w', '--warmup', help='warmup count before each run', default=10)
    parser.add_argument('-o', '--output', help='Output file path to store result. Should begin with an underscore (_) or dot (.)', default=None)
    parser.add_argument('-a', '--all', help='benchmark with all configs (pts, nts, ojs)', default=False)
    parser.add_argument('-r', '--runs', help='number of runs per test', default=50)
    args = parser.parse_args()

    fn, fn_all = get_filenames(args.output)
    run_all_benches(args.directory, args.warmup, "Performing nts vs pts run", 'ojs', fn, args.runs)
    write_results(fn)
    if args.all:
        run_all_benches(args.directory, args.warmup, "Performing all runs", None, fn_all, args.runs)
        write_results(fn_all)

if __name__ == '__main__':
    main()
