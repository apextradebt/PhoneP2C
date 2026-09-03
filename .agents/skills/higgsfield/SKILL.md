---
name: higgsfield
description: >-
  Provides guidance and workflows for interacting with Higgsfield AI via the Higgsfield MCP connector (https://mcp.higgsfield.ai/mcp) to generate images, videos, characters, and audio.
---

# Higgsfield MCP Integration

This skill provides integration with the Higgsfield MCP server to generate media assets using Higgsfield's AI models (e.g. video generation, image generation, character rendering, camera controls).

## Endpoint Configuration

- **Server URL**: `https://mcp.higgsfield.ai/mcp`
- **Transport**: SSE (Server-Sent Events)

## Usage

1. **Authentication**: When connecting for the first time via Antigravity or your MCP client, authenticate with your Higgsfield account if prompted.
2. **Generations**: Use the exposed MCP tools to create and query image/video generation jobs.
3. **Credit Management**: Keep in mind that generations via the MCP server consume Higgsfield account credits at standard rates.
