#!/usr/bin/env bun

async function main() {
  const args = Bun.argv.slice(2);

  try {
    if (args.length === 0) {
      // 標準入力モード
      await convertFromStdin();
    } else if (args.length === 2) {
      // ファイル指定モード
      const inputPath = args[0]!;
      const outputPath = args[1]!;
      await convertFile(inputPath, outputPath);
    } else {
      showUsage();
      process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function convertFromStdin() {
  const stdin = await Bun.stdin.text();

  if (!stdin.trim()) {
    throw new Error("No input provided");
  }

  const { data, format } = parseInput(stdin, "stdin");
  const output = convertData(data, format);

  console.log(output);
}

async function convertFile(inputPath: string, outputPath: string) {
  const inputFile = Bun.file(inputPath);

  if (!(await inputFile.exists())) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const inputText = await inputFile.text();
  const { data, format } = parseInput(inputText, inputPath);
  const output = convertData(data, format);

  await Bun.write(outputPath, output);
  console.log(`Converted ${inputPath} to ${outputPath}`);
}

function parseInput(text: string, source: string): { data: any; format: "yaml" | "json" } {
  // ファイルパスから拡張子で判定
  if (source !== "stdin") {
    const ext = source.toLowerCase();
    if (ext.endsWith(".yaml") || ext.endsWith(".yml")) {
      return { data: Bun.YAML.parse(text), format: "yaml" };
    } else if (ext.endsWith(".json")) {
      return { data: JSON.parse(text), format: "json" };
    }
  }

  // 拡張子がない場合は内容で判定（パース試行）
  // まずJSONとして試す
  try {
    const jsonData = JSON.parse(text);
    return { data: jsonData, format: "json" };
  } catch {
    // JSON失敗したらYAMLとして試す
    try {
      const yamlData = Bun.YAML.parse(text);
      return { data: yamlData, format: "yaml" };
    } catch {
      throw new Error("Failed to parse input as JSON or YAML");
    }
  }
}

function convertData(data: any, inputFormat: "yaml" | "json"): string {
  if (inputFormat === "yaml") {
    // YAML -> JSON
    return JSON.stringify(data, null, 2);
  } else {
    // JSON -> YAML
    return Bun.YAML.stringify(data, null, 2);
  }
}

function showUsage() {
  console.error(`
Usage:
  File mode:   bunjy <input> <output>
  Stdin mode:  cat <input> | bunjy > <output>

Examples:
  bunjy input.yaml output.json    # Convert YAML to JSON
  bunjy input.json output.yaml    # Convert JSON to YAML
  cat data.yaml | bunjy           # Convert from stdin to stdout
`);
}

main();
