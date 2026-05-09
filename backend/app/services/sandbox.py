import subprocess
import tempfile
import time
import os
from pathlib import Path

from app.config import settings


LANGUAGE_CONFIGS = {
    "c": {
        "extension": ".c",
        "compile": ["gcc", "/code/source.c", "-o", "/code/prog", "-Wall", "-Wextra"],
        "run": ["./code/prog"],
    },
    "cpp": {
        "extension": ".cpp",
        "compile": ["g++", "/code/source.cpp", "-o", "/code/prog", "-Wall", "-Wextra", "-std=c++17"],
        "run": ["./code/prog"],
    },
    "python": {
        "extension": ".py",
        "compile": None,
        "run": ["python3", "-c"],
    },
    "javascript": {
        "extension": ".js",
        "compile": None,
        "run": ["node", "-e"],
    },
}


def execute_code_local(code: str, language: str, stdin: str = ""):
    config = LANGUAGE_CONFIGS.get(language)
    if not config:
        raise ValueError(f"Unsupported language: {language}")

    tmp_dir = tempfile.mkdtemp()
    code_path = Path(tmp_dir) / f"source{config['extension']}"
    code_path.write_text(code, encoding="utf-8")

    start = time.time()
    try:
        if config["compile"]:
            compile_cmd = [c.replace("/code", tmp_dir) for c in config["compile"]]
            comp = subprocess.run(
                compile_cmd, capture_output=True, text=True, timeout=30, cwd=tmp_dir,
            )
            if comp.returncode != 0:
                return {
                    "output": "",
                    "error": comp.stderr,
                    "exit_code": comp.returncode,
                    "execution_time_ms": 0,
                    "memory_used_kb": 0,
                }

        run_cmd = [c.replace("/code", tmp_dir) for c in config["run"]]
        if not config["compile"]:
            run_cmd = config["run"] + [code]

        result = subprocess.run(
            run_cmd,
            capture_output=True,
            text=True,
            timeout=settings.EXECUTION_TIMEOUT_SECONDS,
            input=stdin,
            cwd=tmp_dir,
        )
        elapsed = (time.time() - start) * 1000

        return {
            "output": result.stdout.strip(),
            "error": result.stderr.strip(),
            "exit_code": result.returncode,
            "execution_time_ms": round(elapsed, 2),
            "memory_used_kb": 0,
        }
    except subprocess.TimeoutExpired:
        return {
            "output": "",
            "error": f"Execution timed out after {settings.EXECUTION_TIMEOUT_SECONDS}s",
            "exit_code": -1,
            "execution_time_ms": settings.EXECUTION_TIMEOUT_SECONDS * 1000,
            "memory_used_kb": 0,
        }
    except Exception as e:
        return {
            "output": "",
            "error": str(e),
            "exit_code": 1,
            "execution_time_ms": 0,
            "memory_used_kb": 0,
        }
    finally:
        import shutil
        shutil.rmtree(tmp_dir, ignore_errors=True)
