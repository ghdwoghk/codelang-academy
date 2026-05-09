FROM ubuntu:22.04

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    python3 \
    python3-pip \
    nodejs \
    npm \
    time \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m sandbox

COPY run_code.sh /usr/local/bin/run_code.sh
RUN chmod +x /usr/local/bin/run_code.sh

USER sandbox
WORKDIR /tmp

ENTRYPOINT ["run_code.sh"]
