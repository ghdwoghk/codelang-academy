import os
import uuid
import subprocess
import tempfile
import time
from pathlib import Path

from fastapi import APIRouter, HTTPException
from app.schemas.submission import ExecuteRequest, ExecuteResponse
from app.config import settings

router = APIRouter(prefix="/api/execute", tags=["Code Execution"])

SUPPORTED_LANGUAGES = {
    "c": {"extension": ".c", "compile_cmd": ["gcc", "/code/code.c", "-o", "/code/prog"], "run_cmd": ["./code/prog"]},
    "cpp": {"extension": ".cpp", "compile_cmd": ["g++", "/code/code.cpp", "-o", "/code/prog"], "run_cmd": ["./code/prog"]},
    "python": {"extension": ".py", "compile_cmd": None, "run_cmd": ["python3", "/code/code.py"]},
    "javascript": {"extension": ".js", "compile_cmd": None, "run_cmd": ["node", "/code/code.js"]},
}


@router.get("/languages")
def get_languages():
    return {
        "languages": list(SUPPORTED_LANGUAGES.keys()),
        "docker_enabled": settings.DOCKER_ENABLED,
    }


@router.post("", response_model=ExecuteResponse)
def execute_code(data: ExecuteRequest):
    if data.language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {data.language}")
    if len(data.code) > settings.MAX_CODE_LENGTH:
        raise HTTPException(status_code=400, detail=f"Code exceeds max length of {settings.MAX_CODE_LENGTH}")

    lang_config = SUPPORTED_LANGUAGES[data.language]

    if settings.DOCKER_ENABLED:
        return _execute_in_docker(data, lang_config)
    else:
        return _execute_local(data, lang_config)


def _execute_docker(data: ExecuteRequest, lang_config: dict) -> ExecuteResponse:
    import docker
    client = docker.from_env()

    code_file = f"/tmp/code_{uuid.uuid4().hex}{lang_config['extension']}"
    with open(code_file, "w") as f:
        f.write(data.code)

    try:
        container = client.containers.run(
            image=settings.DOCKER_SANDBOX_IMAGE,
            command=f"timeout {settings.EXECUTION_TIMEOUT_SECONDS} python3 /runner.py",
            volumes={code_file: {"bind": "/code/user_code", "mode": "ro"}},
            network_disabled=True,
            mem_limit="256m",
            cpu_period=100000,
            cpu_quota=100000,
            pids_limit=50,
            read_only=True,
            tmpfs={"/tmp": "size=64m"},
            detach=True,
        )

        start = time.time()
        result = container.wait(timeout=settings.EXECUTION_TIMEOUT_SECONDS + 5)
        elapsed = (time.time() - start) * 1000
        logs = container.logs(stdout=True, stderr=True).decode("utf-8").strip()
        container.remove(force=True)

        lines = logs.split("\n")
        stdout = "\n".join(line for line in lines if not line.startswith("STDERR:"))
        stderr = "\n".join(line for line in lines if line.startswith("STDERR:"))
        stderr = stderr.replace("STDERR:", "").strip()

        return ExecuteResponse(
            output=stdout.strip(),
            error=stderr.strip(),
            exit_code=result["StatusCode"],
            execution_time_ms=round(elapsed, 2),
            memory_used_kb=0,
        )
    except docker.errors.ContainerError as e:
        return ExecuteResponse(output="", error=str(e), exit_code=1, execution_time_ms=0, memory_used_kb=0)
    except Exception as e:
        return ExecuteResponse(output="", error=f"Execution error: {str(e)}", exit_code=1, execution_time_ms=0, memory_used_kb=0)
    finally:
        if os.path.exists(code_file):
            os.remove(code_file)


def _execute_local(data: ExecuteRequest, lang_config: dict) -> ExecuteResponse:
    tmp_dir = tempfile.mkdtemp()
    code_path = Path(tmp_dir) / f"code{lang_config['extension']}"
    code_path.write_text(data.code, encoding="utf-8")

    start = time.time()
    try:
        if lang_config["compile_cmd"]:
            compile_result = subprocess.run(
                lang_config["compile_cmd"],
                capture_output=True, text=True, timeout=15, cwd=tmp_dir,
            )
            if compile_result.returncode != 0:
                return ExecuteResponse(
                    output="",
                    error=compile_result.stderr,
                    exit_code=compile_result.returncode,
                    execution_time_ms=0,
                    memory_used_kb=0,
                )

        run_result = subprocess.run(
            lang_config["run_cmd"],
            capture_output=True, text=True,
            timeout=settings.EXECUTION_TIMEOUT_SECONDS,
            input=data.stdin, cwd=tmp_dir,
        )
        elapsed = (time.time() - start) * 1000

        return ExecuteResponse(
            output=run_result.stdout.strip(),
            error=run_result.stderr.strip(),
            exit_code=run_result.returncode,
            execution_time_ms=round(elapsed, 2),
            memory_used_kb=0,
        )
    except subprocess.TimeoutExpired:
        return ExecuteResponse(
            output="",
            error=f"Execution timed out after {settings.EXECUTION_TIMEOUT_SECONDS} seconds",
            exit_code=-1,
            execution_time_ms=settings.EXECUTION_TIMEOUT_SECONDS * 1000,
            memory_used_kb=0,
        )
    except Exception as e:
        return ExecuteResponse(output="", error=str(e), exit_code=1, execution_time_ms=0, memory_used_kb=0)
    finally:
        import shutil
        shutil.rmtree(tmp_dir, ignore_errors=True)
