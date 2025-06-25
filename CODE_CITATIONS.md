# Code Citations

This document references code snippets and patterns that have been adapted from external sources.

## Docker Configuration

### Backend Dockerfile

Our backend Dockerfile has been inspired by or adapted from the following sources:

- **New Relic Documentation** (License: Unknown)
  - Source: https://github.com/newrelic/docs-website/blob/b95a19befa700aa59d0b635d561668d5158cf845/src/install/python/python-agent-uvicorn-docker.mdx
  - Used for basic Python FastAPI Docker setup patterns

- **Digital Accordions Project** (License: MIT)
  - Source: https://github.com/opensourceducation/Digital-Accordions/blob/6fb61ab95908fc03c326ac09a555547f39a52e35/api/services/login/dockerfile
  - Used for dependency installation patterns

- **FastAPI PostgreSQL Project** (License: Unknown)
  - Source: https://github.com/angelika233/FastAPI_PostgreSQL/blob/9318b2325d6a9309c278a1471a12238facff4e93/Dockerfile.fastapi
  - Used for general FastAPI container configuration

Common patterns used from these sources include:
- Using slim Python images
- Setting up the working directory
- Copying requirements.txt separately for better layer caching
- Installing dependencies with --no-cache-dir
- Setting up the uvicorn command to run the FastAPI app
