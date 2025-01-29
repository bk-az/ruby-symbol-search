import { OpenBlock, ParsedToken, Symbol, SymbolType } from "./types";

const symbolPatterns: Record<string, { regex: RegExp; type: SymbolType }> = {
  class: { regex: /^\s*class\s+([^\s<;]+)/, type: "class" },
  sClass: { regex: /^\s*class\s*<<\s*([^\s;]+)/, type: "class" },
  module: { regex: /^\s*module\s+([^\s;]+)/, type: "module" },
  method: { regex: /^\s*def\s+([^\s(;]+)/, type: "method" },
  constant: { regex: /^\s*([A-Z][A-Za-z0-9_:]*)\s*=[^=>~]/, type: "constant" },
  scope: { regex: /^\s*scope\s+:([a-zA-Z0-9_]+[!?]?)/, type: "scope" },
  alias: { regex: /^\s*alias\s+([^\s]+)/, type: "alias" },
  aliasM: { regex: /^\s*alias_method\s+:([^\s,]+)/, type: "alias" },
  aliasA: { regex: /^\s*alias_attribute\s+:([^\s,]+)/, type: "alias" },
  attr: {
    regex:
      /^\s*attr_(?:reader|writer|accessor)\(?\s*((?::\w+[?!=]?)(?:\s*,\s*:\w+[?!=]?)*)?/,
    type: "attribute",
  },
  mattr: {
    regex:
      /^\s*mattr_(?:reader|writer|accessor)\(?\s*((?::\w+[?!=]?)(?:\s*,\s*:\w+[?!=]?)*)?/,
    type: "attribute",
  },
  tm_accessor: {
    regex:
      /^\s*thread_mattr_accessor\(?\s*((?::\w+[?!=]?)(?:\s*,\s*:\w+[?!=]?)*)?/,
    type: "attribute",
  },
  attribute: { regex: /^\s*attribute\(?\s*:(\w+[?!=]?)?/, type: "attribute" },
  date_attribute: {
    regex: /^\s*date_attribute\(?\s*:(\w+[?!=]?)?/,
    type: "attribute",
  },
  class_attribute: {
    regex: /^\s*class_attribute\(?\s*((?::\w+[?!=]?)(?:\s*,\s*:\w+[?!=]?)*)?/,
    type: "attribute",
  },
  attributes: {
    regex: /^\s*attributes\(?\s*((?::\w+[?!=]?)(?:\s*,\s*:\w+[?!=]?)*)?/,
    type: "attribute",
  },
  delegate: {
    regex: /^\s*delegate\(?\s*((?::\w+[?!=]?)(?:\s*,\s*:\w+[?!=]?)*)?/,
    type: "attribute",
  },
  attr_cont: {
    regex: /^\s*((?::\w+[?!=]?)(?:\s*,\s*:\w+[?!=]?)*)/,
    type: "attribute",
  },
  association: {
    regex:
      /^\s*(?:belongs_to|has_one|has_many|has_and_belongs_to_many)\s+:(\w+)/,
    type: "association",
  },
  namespace: {
    regex: /^\s*namespace\s+:(\w+)/,
    type: "namespace",
  },
  task: {
    regex: /^\s*task\s+(\w+)/,
    type: "task",
  },
  end: { regex: /^\s*(end)\b/, type: "end" },
  comment: { regex: /^\s*#/, type: "comment" },
};

export default class FileParser {
  file: string;
  content: string;
  fileType: string;
  lastTokenType?: SymbolType;
  fetchDetails?: boolean;

  constructor(
    file: string,
    content: string,
    options = { fetchDetails: false }
  ) {
    this.file = file;
    this.content = content;
    this.fileType = file.endsWith(".rake") ? "rake" : "ruby";
    this.lastTokenType = undefined;
    this.fetchDetails = options.fetchDetails || false;
  }

  getSymbols(): Symbol[] {
    const lines = this.content.split("\n");
    const symbols: Symbol[] = [];
    const stack: OpenBlock[] = [];

    lines.forEach((line, lineNumber) => {
      if (line.match(symbolPatterns.comment.regex)) {
        return;
      }

      const currentLine = lineNumber + 1;
      const token = this.parseLine(line);

      if (!token || !token.symbol) {
        this.lastTokenType = token ? token.type : undefined;
        return;
      }

      const capturedSymbol = token.symbol.trim();
      const type = token.type;
      this.lastTokenType = type;

      if (token.state === "complete") {
        if (type === "attribute") {
          const individualSymbols = capturedSymbol
            .split(/\s*,\s*/)
            .map((s) => s.replace(/^:/, "").trim());

          individualSymbols.forEach((sym) => {
            if (!sym) {
              return;
            }

            symbols.push({
              symbol: sym,
              file: this.file,
              startLine: currentLine,
              type,
            });
          });
        } else {
          symbols.push({
            symbol: capturedSymbol,
            file: this.file,
            startLine: currentLine,
            type,
          });
        }
      } else {
        if (token.state === "open") {
          stack.push({
            type,
            symbol: capturedSymbol,
            startLine: currentLine,
            indentation: (line.match(/^(\s*)/) || [])[1] ?? "",
          });
        } else if (stack.length > 0 && token.state === "close") {
          const openBlock = stack[stack.length - 1];

          if (
            openBlock &&
            line.match(new RegExp(`^${openBlock.indentation}end\\b`))
          ) {
            symbols.push({
              symbol: openBlock.symbol,
              type: openBlock.type,
              file: this.file,
              startLine: openBlock.startLine,
              endLine: currentLine,
            });
            stack.pop();
          }
        }
      }
    });

    if (stack.length > 0) {
      stack.forEach((block) => {
        symbols.push({
          symbol: block.symbol,
          type: block.type,
          file: this.file,
          startLine: block.startLine,
        });
      });
    }

    return symbols;
  }

  parseLine(line: string): ParsedToken | null {
    const matches: Record<
      string,
      { match: RegExpMatchArray; type: SymbolType }
    > = {};
    Object.keys(symbolPatterns).forEach((sym: string) => {
      if (!this.fetchDetails && (sym === "end" || sym === "block")) {
        return;
      }

      if (this.fileType !== "rake" && (sym === "namespace" || sym === "task")) {
        return;
      }

      if (sym === "attr_cont" && this.lastTokenType !== "attribute") {
        return;
      }

      const match = line.match(symbolPatterns[sym].regex);
      if (match) {
        matches[sym] = {
          match,
          type: symbolPatterns[sym].type,
        };
      }
    });

    const blockMatch =
      matches.class || matches.sClass || matches.module || matches.namespace;
    if (blockMatch) {
      const tokenState =
        !this.fetchDetails ||
        (line.includes(";") && line.split(";")[1].match(/\bend\b/))
          ? "complete"
          : "open";
      return {
        state: tokenState,
        symbol: blockMatch.match[1],
        type: blockMatch.type,
      };
    } else if (matches.end) {
      return {
        state: "close",
        symbol: matches.end.match[1],
        type: matches.end.type,
      };
    } else {
      const matchKey = Object.keys(matches);
      if (matchKey.length > 0) {
        const symbolMatch = matches[matchKey[0]];
        const type = symbolMatch.type;
        let symbol = symbolMatch.match[1];

        if (type === "method" && symbol.includes(".")) {
          symbol = symbol.split(".")[1];
        }

        return {
          state: "complete",
          symbol,
          type,
        };
      }
    }

    return null;
  }
}
