FROM mcr.microsoft.com/devcontainers/python:3.12-bookworm

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

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

# Update npm to latest
RUN npm install -g npm@latest

# Note: Project dependencies are installed via postCreateCommand in devcontainer.json
# This keeps the Docker image lean and allows for faster iteration during development

WORKDIR /workspace
