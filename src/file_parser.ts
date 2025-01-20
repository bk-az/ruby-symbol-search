import { Symbol, SymbolType } from "./types";

const symbolPatterns: Array<{ regex: RegExp; type: SymbolType }> = [
  {
    regex: /^\s*class\s+([A-Z][A-Za-z0-9_]*(?:::[A-Z][A-Za-z0-9_]*)*)\b/,
    type: "class",
  },
  {
    regex: /^\s*module\s+([A-Z][A-Za-z0-9_]*(?:::[A-Z][A-Za-z0-9_]*)*)\b/,
    type: "module",
  },
  {
    regex:
      /^\s*def\s+(?:(?:[A-Za-z_][A-Za-z0-9_]*(?:::[A-Za-z_][A-Za-z0-9_]*)*|self)\.)?([a-zA-Z_][A-Za-z0-9_]*[!?=]?)/,
    type: "method",
  },
  {
    regex: /^\s*(?:::)?([A-Z][A-Za-z0-9_]*(?:::[A-Z][A-Za-z0-9_]*)*)\s*=\s+/,
    type: "constant",
  },
  { regex: /\s*scope\s+:([a-zA-Z_][a-zA-Z0-9_]*[!?=]?)/, type: "scope" },
  { regex: /^\s*alias\s+([a-zA-Z_][a-zA-Z0-9_]*[!?=]?)/, type: "alias" },
  {
    regex: /^\s*alias_method\s+:?([a-zA-Z_][a-zA-Z0-9_]*[!?=]?)/,
    type: "alias",
  },
  {
    regex:
      /^\s*attr_(?:reader|writer|accessor)\s+((?::[a-zA-Z0-9_]+)(?:\s*,\s*:[a-zA-Z0-9_]+)*)/,
    type: "accessor",
  },
  {
    regex:
      /^\s*(?:belongs_to|has_one|has_many|has_and_belongs_to_many)\s+:(\w+)/,
    type: "association",
  },
];
export default class FileParser {
  file: string;
  content: string;

  constructor(file: string, content: string) {
    this.file = file;
    this.content = content;
  }

  getSymbols(): Symbol[] {
    const lines = this.content.split("\n");
    const symbolList: Symbol[] = [];

    lines.forEach((line, lineNumber) => {
      if (line.trim().startsWith("# ")) {
        return;
      }
      symbolPatterns.forEach(({ regex, type }) => {
        const match = line.match(regex);
        if (match) {
          const capturedSymbol = match[1].trim();
          const startLine = lineNumber + 1;
          if (type === "accessor") {
            const individualSymbols = capturedSymbol
              .split(/\s*,\s*/)
              .map((s) => s.replace(/^:/, ""));

            individualSymbols.forEach((sym) => {
              symbolList.push({
                symbol: sym.trim(),
                file: this.file,
                startLine,
                type,
              });
            });
          } else {
            symbolList.push({
              symbol: capturedSymbol.trim(),
              file: this.file,
              startLine,
              type,
            });
          }
        }
      });
    });

    return symbolList;
  }
}
