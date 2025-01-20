const Fuse = require("fuse.js");
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { minimatch } from "minimatch";
import { GlobalSymbols, FileSymbols, Symbol, SymbolSearchEntry } from "./types";
import FileParser from "./file_parser";

export default class SymbolStore {
  globalSymbols: GlobalSymbols;
  fileSymbols: FileSymbols;
  idCounter: number;
  symbolIdMap: Record<number, string>;
  fileIdMap: Record<number, string>;
  excludedFolders: string[];
  fuseIndex: any;
  indexInProgress: boolean;

  constructor() {
    this.globalSymbols = {};
    this.fileSymbols = {};
    this.symbolIdMap = {};
    this.fileIdMap = {};
    this.idCounter = 1;
    this.fuseIndex = new Fuse([], {
      includeScore: true,
      threshold: 0.5,
      findAllMatches: true,
      shouldSort: true,
      minMatchCharLength: 2,
    });
    this.indexInProgress = false;
    const config = vscode.workspace.getConfiguration("rubySymbolSearch");
    this.excludedFolders = config.get<string[]>("excludedFolders", []);
  }

  search(query: string): SymbolSearchEntry[] {
    let [searchTerm, fileQuery] = query.split("@");
    let symbols: string[] = [];
    let fileQueryTerms: string[] = [];
    if (fileQuery) {
      fileQueryTerms = fileQuery
        .trim()
        .split(" ")
        .map((e) => e.trim());
    }
    if (!searchTerm && fileQueryTerms) {
      symbols = Object.keys(this.fileSymbols)
        .filter((f) => fileQueryTerms.every((term) => f.includes(term)))
        .flatMap((f) => this.fileSymbols[f].symbolIds)
        .map((id) => this.symbolIdMap[id]);
    } else {
      const results = this.fuseIndex.search(searchTerm.trim());
      symbols = results.map((r: any) => r.item);
    }
    const result: SymbolSearchEntry[] = [];
    for (const symbol of symbols) {
      const globalEntry = this.globalSymbols[symbol];
      if (!globalEntry) {
        continue;
      }

      let locations = globalEntry.locations;
      if (fileQueryTerms) {
        locations = locations.filter((l) =>
          fileQueryTerms.every((term) => l.file.includes(term))
        );
      }

      if (locations.length === 0) {
        continue;
      }
      result.push({
        symbol,
        locations,
      });
    }

    return result;
  }

  async index() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }

    const statusBarItem = vscode.window.createStatusBarItem();
    statusBarItem.text = "$(sync~spin) Ruby Symbols: Indexing";
    statusBarItem.show();
    await new Promise((resolve) => setTimeout(resolve, 0));

    this.indexInProgress = true;
    for (const folder of workspaceFolders) {
      const folderPath = folder.uri.fsPath;

      if (!this.isExcluded(folderPath)) {
        await this.indexFolder(folderPath);
      }
    }

    this.indexInProgress = false;
    this.fuseIndex.setCollection(Object.keys(this.globalSymbols));
    statusBarItem.text = "$(check-all) Ruby Symbols: Indexing Done";
    setTimeout(() => statusBarItem.hide(), 10000);
  }

  async indexFolder(folderPath: string) {
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);

      if (this.isExcluded(fullPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.indexFolder(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".rb")) {
        this.indexRubyFile(fullPath);
      }
    }
  }

  indexRubyFile(filePath: string) {
    if (this.isExcluded(filePath)) {
      return;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const parser = new FileParser(filePath, content);

    this.removeFileSymbols(filePath);

    parser.getSymbols().forEach((symbol: Symbol) => {
      this.registerSymbol(symbol);
    });
  }

  registerSymbol(symbol: Symbol) {
    const { symbol: symbolName, file, startLine, type } = symbol;

    let globalEntry = this.globalSymbols[symbolName];
    if (!globalEntry) {
      globalEntry = { id: this.idCounter++, locations: [] };
      this.globalSymbols[symbolName] = globalEntry;
      if (!this.indexInProgress) {
        this.fuseIndex.add(symbolName);
      }
    }

    globalEntry.locations.push({ file, startLine, type });

    let fileData = this.fileSymbols[file];
    if (!fileData) {
      fileData = {
        id: this.idCounter++,
        symbolIds: [],
      };
      this.fileSymbols[file] = fileData;
    }

    fileData.symbolIds.push(globalEntry.id);

    this.symbolIdMap[globalEntry.id] = symbolName;
  }

  removeFileSymbols(file: string) {
    const fileData = this.fileSymbols[file];
    if (!fileData) {
      return;
    }

    for (const id of fileData.symbolIds) {
      const sym = this.symbolIdMap[id];
      const globalEntry = this.globalSymbols[sym];
      if (!globalEntry) {
        continue;
      }

      globalEntry.locations = globalEntry.locations.filter(
        (location) => location.file !== file
      );

      if (globalEntry.locations.length === 0) {
        delete this.globalSymbols[sym];
        delete this.symbolIdMap[id];
        this.fuseIndex.remove((doc: string) => {
          return doc === sym;
        });
      }
    }

    delete this.fileIdMap[fileData.id];
    delete this.fileSymbols[file];
  }

  isExcluded(filePath: string): boolean {
    return this.excludedFolders.some((pattern) => minimatch(filePath, pattern));
  }
}
