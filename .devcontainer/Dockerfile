FROM mcr.microsoft.com/devcontainers/python:3.12-bookworm

# Install system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    postgresql-client \
    curl \
    wget \
    git \
    vim \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Requirements からインストール
COPY requirements.txt ./
RUN pip install -r requirements.txt

WORKDIR /workspace
