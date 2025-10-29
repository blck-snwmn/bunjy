# bunjy

A simple YAML ⇄ JSON converter CLI built with Bun only.

## Features

- Convert YAML to JSON and JSON to YAML
- No external dependencies (uses Bun's built-in APIs only)
- Single binary executable

## Usage

```bash
# YAML → JSON
cat input.yaml | bun index.ts > output.json

# JSON → YAML
cat input.json | bun index.ts > output.yaml
```

## Build

Build a single binary executable:

```bash
bun run build
```

Then use the binary:

```bash
cat input.yaml | ./bunjy > output.json
cat input.json | ./bunjy > output.yaml
```

## Examples

See `examples/` directory for sample files.
