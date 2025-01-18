import { Symbol, SymbolType } from "./types";

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

    const symbolPatterns: Array<{ regex: RegExp; type: SymbolType }> = [
      { regex: /^\s*class\s+(\w+)/, type: "class" },
      { regex: /^\s*module\s+(\w+)/, type: "module" },
      {
        regex: /^\s*def\s+(?![A-Z][a-zA-Z0-9_]*\.)[a-zA-Z_][a-zA-Z0-9_]*[!?=]?/,
        type: "method",
      },
      { regex: /^\s*([A-Z][A-Z0-9_]*)\s*=\s+/, type: "constant" },
      { regex: /\s*scope\s+:([a-zA-Z_][a-zA-Z0-9_]*[!?=]?)/, type: "scope" },
      { regex: /^\s*alias\s+([a-zA-Z_][a-zA-Z0-9_]*[!?=]?)/, type: "alias" },
      {
        regex: /^\s*alias_method\s+:?([a-zA-Z_][a-zA-Z0-9_]*[!?=]?)/,
        type: "alias",
      },
      {
        regex:
          /^\s*attr_(reader|writer|accessor)\s+((?::[a-zA-Z0-9_]+)(?:\s*,\s*:[a-zA-Z0-9_]+)*)/,
        type: "accessor",
      },
      {
        regex:
          /^\s*(belongs_to|has_one|has_many|has_and_belongs_to_many)\s+:(\w+)/,
        type: "association",
      },
    ];

    lines.forEach((line, lineNumber) => {
      symbolPatterns.forEach(({ regex, type }) => {
        const match = line.match(regex);
        if (match) {
          if (type === "accessor") {
            const accessorSymbolsPart = match[2];
            const individualSymbols = accessorSymbolsPart
              .split(/\s*,\s*/)
              .map((s) => s.replace(/^:/, ""));

            individualSymbols.forEach((sym) => {
              symbolList.push({
                symbol: sym,
                file: this.file,
                line: lineNumber + 1,
                type,
              });
            });
          } else {
            let capturedSymbol = match[1];

            if (type === "association") {
              capturedSymbol = match[2];
            }

            symbolList.push({
              symbol: capturedSymbol,
              file: this.file,
              line: lineNumber + 1,
              type,
            });
          }
        }
      });
    });

    return symbolList;
  }
}
