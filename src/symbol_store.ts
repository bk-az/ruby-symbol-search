import FlexSearch, { IndexSearchResult } from "flexsearch";
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
  reverseIndex: FlexSearch.Index;
  forwardIndex: FlexSearch.Index;
  wordIndex: FlexSearch.Index;
  fileIndex: FlexSearch.Index;
  excludedFolders: string[];

  constructor() {
    this.globalSymbols = {};
    this.fileSymbols = {};
    this.symbolIdMap = {};
    this.fileIdMap = {};
    this.idCounter = 1;
    this.reverseIndex = new FlexSearch.Index({
      encode: (str) =>
        str
          .replace(/([a-z])([A-Z])/g, "$1_$2")
          .toLowerCase()
          .split(/[^a-z]+/),
      tokenize: "reverse",
    });
    this.forwardIndex = new FlexSearch.Index({
      encode: (str) =>
        str
          .replace(/([a-z])([A-Z])/g, "$1_$2")
          .toLowerCase()
          .split(/[^a-z]+/),
      tokenize: "forward",
    });
    this.wordIndex = new FlexSearch.Index({
      encode: (str) =>
        str
          .replace(/([a-z])([A-Z])/g, "$1_$2")
          .toLowerCase()
          .split(/[^a-z]+/),
      tokenize: "strict",
    });
    this.fileIndex = new FlexSearch.Index({
      encode: (str) => str.split(".")[0].split(/[^a-z]+/),
      tokenize: "strict",
    });
    const config = vscode.workspace.getConfiguration("rubySymbolSearch");
    this.excludedFolders = config.get<string[]>("excludedFolders", []);
  }

  search(query: string): SymbolSearchEntry[] {
    const reverseResults = this.reverseIndex.search(query, { suggest: true });
    const forwardResults = this.forwardIndex.search(query, { suggest: true });
    const wordResults = this.wordIndex.search(query, { suggest: true });
    const fileResults = this.fileIndex.search(query);

    const combinedResults: Record<number, number> = {};

    const addScores = (
      results: IndexSearchResult,
      multiplier: number,
      type: string
    ) => {
      let ids = results;
      if (type === "file") {
        ids = [];
        for (const fileId of results) {
          const fileName = this.fileIdMap[Number(fileId)];
          if (!fileName) {
            continue;
          }

          const fileData = this.fileSymbols[fileName];
          if (!fileData) {
            continue;
          }

          fileData.symbolIds.forEach((id) => {
            if (!ids.includes(id)) {
              ids.push(id);
            }
          });
        }
      }
      ids.forEach((id, index) => {
        const score = (results.length - index) * multiplier;
        if (combinedResults[Number(id)]) {
          combinedResults[Number(id)] += score;
        } else {
          combinedResults[Number(id)] = score;
        }
      });
    };

    addScores(wordResults, 4, "sym");
    addScores(forwardResults, 6, "sym");
    addScores(reverseResults, 2, "sym");
    addScores(fileResults, 2, "file");

    const sortedIds = Object.keys(combinedResults)
      .map(Number)
      .sort((a, b) => combinedResults[b] - combinedResults[a]);

    const result: SymbolSearchEntry[] = [];
    for (const id of sortedIds) {
      const symbol = this.symbolIdMap[id];
      if (!symbol) {
        continue;
      }

      const globalEntry = this.globalSymbols[symbol];
      if (!globalEntry) {
        continue;
      }

      result.push({
        symbol,
        locations: globalEntry.locations,
      });
    }

    return result;
  }

  async index() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage(
        "No workspace is open. Please open a workspace to index files."
      );
      return;
    }

    for (const folder of workspaceFolders) {
      const folderUri = folder.uri;
      const folderPath = folderUri.fsPath;

      if (!this.isExcluded(folderPath)) {
        await this.indexFolder(folderPath);
      }
    }

    vscode.window.showInformationMessage("Ruby symbol indexing complete.");
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
    const relativePath = vscode.workspace.asRelativePath(filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    const parser = new FileParser(filePath, content);

    this.removeFileSymbols(relativePath);

    parser.getSymbols().forEach((symbol: Symbol) => {
      this.registerSymbol(symbol);
    });
  }

  registerSymbol(symbol: Symbol) {
    const { symbol: symbolName, file, line, type } = symbol;

    let globalEntry = this.globalSymbols[symbolName];
    if (!globalEntry) {
      globalEntry = { id: this.idCounter++, locations: [] };
      this.globalSymbols[symbolName] = globalEntry;
      this.reverseIndex.add(globalEntry.id, symbolName);
      this.forwardIndex.add(globalEntry.id, symbolName);
      this.wordIndex.add(globalEntry.id, symbolName);
    }

    globalEntry.locations.push({ file, line, type });

    let fileData = this.fileSymbols[file];
    if (!fileData) {
      fileData = {
        id: this.idCounter++,
        symbolIds: [],
      };
      this.fileSymbols[file] = fileData;
      this.fileIndex.add(fileData.id, file);
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
        this.reverseIndex.remove(id);
        this.forwardIndex.remove(id);
        this.wordIndex.remove(id);
      }
    }

    this.fileIndex.remove(fileData.id);
    delete this.fileIdMap[fileData.id];
    delete this.fileSymbols[file];
  }

  isExcluded(filePath: string): boolean {
    return this.excludedFolders.some((pattern) => minimatch(filePath, pattern));
  }
}
