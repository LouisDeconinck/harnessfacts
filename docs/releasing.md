# Releases and hosting

The public repository is [LouisDeconinck/harnessfacts](https://github.com/LouisDeconinck/harnessfacts). The website runs on [GitHub Pages](https://louisdeconinck.github.io/harnessfacts/).

## Website deployment

Pushes to main run `.github/workflows/pages.yml`: frozen dependency installation, lint, typecheck, project tests, result validation, static build, and deployment. Deployment uses GitHub Pages Actions artifacts and the github-pages environment. No model credentials or hosting secrets are required.

Astro uses `https://louisdeconinck.github.io` with base `/harnessfacts`; internal navigation, assets, and evidence links include that path. Configure both Astro and Pages if adding a custom domain later. Use the workflow_dispatch action to redeploy manually.

## Package releases

npm packages are prepared locally but are not yet published. Before a release:

1. Run frozen install, lint, typecheck, tests, validate, and build. Inspect evidence for secrets and document coverage.
2. Inspect tarballs using `bun pm pack` in packages/data and packages/cli. Test the extracted data package under Node/TypeScript and the CLI under Bun outside the checkout.
3. With npm namespace access and publication authorization, publish @harnessfacts/data and harnessfacts using `npm publish --access public`. Never put credentials in source or evidence.
4. Create a GitHub release using generated release notes. `.github/release.yml` groups changes; GitHub recognizes new contributors.

The data package is dependency-free ESM JavaScript with TypeScript declarations and a JSON export. The CLI requires Bun and ships its fixture catalog. Runs write to the calling directory's results/ or HARNESSFACTS_RESULTS_DIR.

## Community setup

Project labels from `.github/labels.json` and all 16 [contribution issues](launch-issues.md) are published. Issue templates, a pull request template, contribution guidance, Apache-2.0 licensing, and private vulnerability reporting are enabled. OAuth tests, scheduled agent runners, and signed attestations remain deferred.
