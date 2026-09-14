# External Node/TypeScript consumer

Copy this directory **outside the HarnessFacts checkout**. After npm publication:

```sh
npm install
npm start
```

Requires Node 20+. `npm start` typechecks with strict NodeNext resolution and runs the emitted JavaScript under Node. Imports use only the published `@harnessfacts/data` exports, with no Bun or repository-source dependency. The package is a static snapshot, not a network client.

Before publication, install the packed candidate instead of the registry dependency:

```sh
npm install /absolute/path/to/harnessfacts-data-0.1.0.tgz
npm start
```

`latestObservation` returns the newest attempt matching the query, including errors; it does not prove every test for that capability passed. Inspect the exact version, environment, date, status and evidence. For a coherent multi-capability gate, use the [Action](../../check/README.md).
