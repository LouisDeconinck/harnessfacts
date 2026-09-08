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
    const type = checker
      .typeToString(
        checker.getTypeOfSymbolAtLocation(symbol, source),
        source,
        flags,
      )
      .replace(/import\("[^"]*\/schema\/src\/index"\)\./g, "");
    if (type.includes("import("))
      throw new Error(`Unexpected external type in ${symbol.name}`);
    declarations.push(`export declare const ${symbol.name}: ${type};`);
  }
  await Bun.write(
    join(root, "packages/data/dist/index.d.ts"),
    `${declarations.join("\n")}\n`,
  );
}
