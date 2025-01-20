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
    regex: /^\s*attr_(?:reader|writer|accessor)\s+((?::\w+)(?:\s*,\s*:\w+)*)/,
    type: "attr",
  },
  mattr: {
    regex: /^\s*mattr_(?:reader|writer|accessor)\s+((?::\w+)(?:\s*,\s*:\w+)*)/,
    type: "attr",
  },
  tm_accessor: {
    regex: /^\s*thread_mattr_accessor\s+((?::\w+)(?:\s*,\s*:\w+)*)/,
    type: "attr",
  },
  attribute: { regex: /^\s*attribute\s+:(\w+)/, type: "attr" },
  association: {
    regex:
      /^\s*(?:belongs_to|has_one|has_many|has_and_belongs_to_many)\s+:(\w+)/,
    type: "association",
  },
  block: {
    regex: /\b(?<!:)(if|unless|while|until|for|case|begin|do)(?!:)\b/,
    type: "block",
  },
  end: { regex: /^[^#"']*\b(end)\b/, type: "end" },
  comment: { regex: /^\s*#/, type: "comment" },
};

const singleLineBlock = ["if", "unless", "until", "while"];
export default class FileParser {
  file: string;
  content: string;
  fetchDetails?: boolean;

  constructor(
    file: string,
    content: string,
    options = { fetchDetails: false }
  ) {
    this.file = file;
    this.content = content;
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

      const statements = line.split(";");
      const currentLine = lineNumber + 1;

      statements.forEach((statement) => {
        if (line.match(symbolPatterns.comment.regex)) {
          return;
        }

        const tokens: ParsedToken[] = this.parseStatement(statement);
        tokens.forEach((token) => {
          const capturedSymbol = token.symbol.trim();
          const type = token.type;
          if (type === "attr") {
            const individualSymbols = capturedSymbol
              .split(/\s*,\s*/)
              .map((s) => s.replace(/^:/, ""));

            individualSymbols.forEach((sym) => {
              symbols.push({
                symbol: sym.trim(),
                file: this.file,
                startLine: currentLine,
                type,
              });
            });
          } else {
            if (token.kind === "open") {
              stack.push({
                type,
                symbol: capturedSymbol,
                startLine: currentLine,
              });
            } else if (token.kind === "close") {
              const openBlock = stack.pop();
              if (openBlock) {
                symbols.push({
                  symbol: openBlock.symbol,
                  type: openBlock.type,
                  file: this.file,
                  startLine: openBlock.startLine,
                  endLine: currentLine,
                });
              }
            } else {
              symbols.push({
                symbol: capturedSymbol,
                file: this.file,
                startLine: currentLine,
                type,
              });
            }
          }
        });
      });
    });

    return symbols;
  }

  parseStatement(statement: string): ParsedToken[] {
    const matches: Record<string, RegExpMatchArray | null> = {};
    const tokens: ParsedToken[] = [];
    Object.keys(symbolPatterns).forEach((sym: string) => {
      if (!this.fetchDetails && (sym === "end" || sym === "block")) {
        return;
      }

      matches[sym] = statement.match(symbolPatterns[sym].regex);
    });

    const openBlockType = this.fetchDetails ? "open" : "complete";
    if (matches.class) {
      tokens.push({
        kind: openBlockType,
        symbol: matches.class[1],
        type: symbolPatterns.class.type,
      });
    }
    if (matches.sClass) {
      tokens.push({
        kind: openBlockType,
        symbol: matches.sClass[1],
        type: symbolPatterns.sClass.type,
      });
    }
    if (matches.module) {
      tokens.push({
        kind: openBlockType,
        symbol: matches.module[1],
        type: symbolPatterns.module.type,
      });
    }
    if (matches.method) {
      tokens.push({
        kind: openBlockType,
        symbol: matches.method[1],
        type: symbolPatterns.method.type,
      });
    }
    if (matches.block) {
      const blockType = matches.block[1];
      const prefix = statement.split(blockType)[0];
      if (singleLineBlock.includes(blockType) && prefix.match(/[^=\s]+\s*$/)) {
      } else {
        tokens.push({
          kind: "open",
          symbol: blockType,
          type: symbolPatterns.block.type,
        });
      }
    }
    if (matches.end) {
      tokens.push({
        kind: "close",
        symbol: matches.end[1],
        type: symbolPatterns.end.type,
      });
    }
    if (matches.constant) {
      tokens.push({
        kind: "complete",
        symbol: matches.constant[1],
        type: symbolPatterns.constant.type,
      });
    }
    if (matches.scope) {
      tokens.push({
        kind: "complete",
        symbol: matches.scope[1],
        type: symbolPatterns.scope.type,
      });
    }
    if (matches.alias) {
      tokens.push({
        kind: "complete",
        symbol: matches.alias[1],
        type: symbolPatterns.alias.type,
      });
    }
    if (matches.aliasM) {
      tokens.push({
        kind: "complete",
        symbol: matches.aliasM[1],
        type: symbolPatterns.aliasM.type,
      });
    }
    if (matches.aliasA) {
      tokens.push({
        kind: "complete",
        symbol: matches.aliasA[1],
        type: symbolPatterns.aliasA.type,
      });
    }
    if (matches.attr) {
      tokens.push({
        kind: "complete",
        symbol: matches.attr[1],
        type: symbolPatterns.attr.type,
      });
    }
    if (matches.mattr) {
      tokens.push({
        kind: "complete",
        symbol: matches.mattr[1],
        type: symbolPatterns.mattr.type,
      });
    }
    if (matches.tm_accessor) {
      tokens.push({
        kind: "complete",
        symbol: matches.tm_accessor[1],
        type: symbolPatterns.tm_accessor.type,
      });
    }
    if (matches.attribute) {
      tokens.push({
        kind: "complete",
        symbol: matches.attribute[1],
        type: symbolPatterns.attribute.type,
      });
    }
    if (matches.association) {
      tokens.push({
        kind: "complete",
        symbol: matches.association[1],
        type: symbolPatterns.association.type,
      });
    }

    return tokens;
  }
}
