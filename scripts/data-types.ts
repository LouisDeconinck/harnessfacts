import { join } from "node:path";
import ts from "typescript";
import { root } from "../packages/core/src/catalog.ts";

// Flatten inferred types to keep the published data package dependency-free.
export async function buildDataTypes() {
  const entry = join(root, "packages/data/src/index.ts");
  const program = ts.createProgram([entry], {
    target: ts.ScriptTarget.ES2023,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    resolveJsonModule: true,
    allowImportingTsExtensions: true,
  });
  const checker = program.getTypeChecker();
  const schema = program.getSourceFile(
    join(root, "packages/schema/src/index.ts"),
  )!;
  const source = program.getSourceFile(entry)!;
  const flags =
    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias;
  const declarations = schema.statements
    .filter(ts.isTypeAliasDeclaration)
    .map(
      (node) =>
        `export type ${node.name.text} = ${checker.typeToString(checker.getTypeAtLocation(node), node, flags)};`,
    );
  for (const symbol of checker.getExportsOfModule(
    checker.getSymbolAtLocation(source)!,
  )) {
    const resolved =
      symbol.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol;
    const isType = !!(resolved.flags & ts.SymbolFlags.Type);
    const type = checker
      .typeToString(
        isType
          ? checker.getDeclaredTypeOfSymbol(resolved)
          : checker.getTypeOfSymbolAtLocation(symbol, source),
        source,
        flags,
      )
      .replace(
        /import\("[^"]*\/(?:schema\/src\/index|data\/src\/model)"\)\./g,
        "",
      );
    if (type.includes("import("))
      throw new Error(`Unexpected external type in ${symbol.name}`);
    declarations.push(
      isType
        ? `export type ${symbol.name} = ${type};`
        : `export declare const ${symbol.name}: ${type};`,
    );
  }
  // Check the declarations alone, without the source aliases available to hide
  // leaked names. The external NodeNext example exercises package resolution too.
  const declarationPath = join(root, "packages/data/dist/index.d.ts");
  await Bun.write(declarationPath, `${declarations.join("\n")}\n`);
  const emitted = ts.createProgram([declarationPath], {
    target: ts.ScriptTarget.ES2023,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    types: [],
    noEmit: true,
  });
  const diagnostics = ts.getPreEmitDiagnostics(emitted);
  if (diagnostics.length)
    throw new Error(
      diagnostics
        .map((diagnostic) =>
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
        )
        .join("\n"),
    );
}
