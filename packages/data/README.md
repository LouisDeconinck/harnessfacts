# @harnessfacts/data

Dependency-free ESM snapshot of HarnessFacts coding-agent compatibility observations, with TypeScript declarations and a JSON export. Documentation claims and runtime observations remain separate; missing evidence is unknown.

After v0.1.0 publication:

```sh
npm install @harnessfacts/data@0.1.0
```

```js
import { getAgent, getCapability, getObservations, latestObservation } from '@harnessfacts/data';
console.log(getAgent('codex')?.name);
console.log(getCapability('instructions.nested'));
const query = { agent: 'codex', capability: 'instructions.nested', platform: 'linux' };
console.log(getObservations(query));
console.log(latestObservation(query));
```

Node 20+ is tested; no Bun runtime is needed. The `@harnessfacts/data/data.json` export contains the complete snapshot, including historical runs and test definitions. Raw evidence is linked from the [website](https://louisdeconinck.github.io/harnessfacts/), not bundled in this package.

Queries return recorded attempts, not universal support. `latestObservation` includes errors. `getAgent` provides history and compact capability summaries of the latest completed observation, not an all-tests compatibility gate. Inspect exact versions, environments, dates and evidence. Use the [Action](https://github.com/LouisDeconinck/harnessfacts/tree/v0.1.0/check) for coherent multi-capability assertions.

[Copyable Node/TypeScript example](https://github.com/LouisDeconinck/harnessfacts/tree/v0.1.0/examples/data-consumer) · [Methodology](https://github.com/LouisDeconinck/harnessfacts/blob/v0.1.0/docs/methodology.md) · [Contribute](https://github.com/LouisDeconinck/harnessfacts/blob/v0.1.0/docs/contributing.md)

Apache-2.0 licensed. v0.1.0 is a release candidate until published.
