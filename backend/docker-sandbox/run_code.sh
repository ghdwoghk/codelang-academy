#!/bin/bash
set -euo pipefail

CODE_FILE=""
LANG=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --file) CODE_FILE="$2"; shift 2;;
        --lang) LANG="$2"; shift 2;;
        --stdin) echo "$2" > /tmp/stdin.txt; shift 2;;
        *) echo "Unknown option: $1"; exit 1;;
    esac
done

if [ -z "$CODE_FILE" ] || [ -z "$LANG" ]; then
    echo "Usage: run_code.sh --file <code_file> --lang <language> [--stdin <input>]"
    exit 1
fi

if [ ! -f "$CODE_FILE" ]; then
    echo "File not found: $CODE_FILE"
    exit 1
fi

cp "$CODE_FILE" /tmp/code

case "$LANG" in
    c)
        gcc /tmp/code -o /tmp/prog -Wall -Wextra 2>/tmp/compile_err
        if [ $? -ne 0 ]; then
            cat /tmp/compile_err
            exit 1
        fi
        if [ -f /tmp/stdin.txt ]; then
            /tmp/prog < /tmp/stdin.txt
        else
            /tmp/prog
        fi
        ;;
    cpp)
        g++ /tmp/code -o /tmp/prog -Wall -Wextra -std=c++17 2>/tmp/compile_err
        if [ $? -ne 0 ]; then
            cat /tmp/compile_err
            exit 1
        fi
        if [ -f /tmp/stdin.txt ]; then
            /tmp/prog < /tmp/stdin.txt
        else
            /tmp/prog
        fi
        ;;
    python)
        if [ -f /tmp/stdin.txt ]; then
            python3 /tmp/code < /tmp/stdin.txt
        else
            python3 /tmp/code
        fi
        ;;
    javascript)
        if [ -f /tmp/stdin.txt ]; then
            node /tmp/code < /tmp/stdin.txt
        else
            node /tmp/code
        fi
        ;;
    *)
        echo "Unsupported language: $LANG"
        exit 1
        ;;
esac
