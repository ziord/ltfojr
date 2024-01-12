#!/bin/bash
set -euxo pipefail

curr_d=$(pwd)
build_type=$1
bun_path=""

install_hyperfine() {
    platform=$(uname -s)
    if [[ platform == "Darwin" ]]; then
        brew install hyperfine
    elif [[ platform == "Linux" ]]; then
        apt install hyperfine
    else
        echo "Platform not supported." && exit 1
    fi
}

# setup bun
if ! command -v bun &> /dev/null; then
    # This is required for building bun, because bun depends on (previous versions of) itself.
    curl -fsSL https://bun.sh/install | bash
fi
echo "setting up bun.."
git submodule update --init --recursive --depth 1 --checkout bun
cd bun && git checkout patches && git config pull.rebase true && git pull origin patches
if [[ $build_type == "Debug" ]]; then
    bun setup
    bun_path=bun/build/bun-debug
elif [[ $build_type == "Release" ]]; then
    bun build:release
    bun_path=bun/build-release/bun
else
    echo "invalid build option" && exit 1
fi
echo "bun setup complete!"

echo "setting up tsc.."
cd $curr_d
git submodule update --init --depth 1 --checkout TypeScript
cd TypeScript && git checkout patches && git config pull.rebase true && git pull origin patches
./install.sh
echo "tsc setup complete!"

if ! command -v hyperfine &> /dev/null; then
   install_hyperfine
else
    echo "hyperfine is available."
fi
cd $curr_d
echo $bun_path > "bun.txt"
echo "Installation complete!"