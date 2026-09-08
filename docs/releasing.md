# Release procedure

The implementation and release are separate. Local builds do not publish, create a public repository, post issues, or deploy a website.

1. Run frozen install, lint, typecheck, tests, validate, and build. Inspect all evidence for secrets and document tested coverage.
2. Inspect package tarballs with `bun pm pack` in packages/data and packages/cli. Test the extracted data package under Node and the CLI under Bun outside the checkout.
3. With maintainer authorization, create the public harnessfacts/harnessfacts repository and push the reviewed source. Enable private vulnerability reporting, apply .github/labels.json, and file the substantive drafts in docs/launch-issues.md.
4. With npm namespace access and approval, publish @harnessfacts/data and harnessfacts from their package directories. Use `npm publish --access public`; never place npm credentials in source or result logs.
5. Deploy apps/web/dist to the chosen static host. The site configuration targets harnessfacts.dev; configure domain ownership and HTTPS in the host. No backend is needed.
6. Create a GitHub release with generated release notes. GitHub's generated notes recognize new contributors; .github/release.yml groups contributions without custom attribution infrastructure.

The data package is ordinary ESM JavaScript with a JSON export. The CLI requires Bun and ships the source modules and fixture catalog needed at runtime. Results are written to the calling directory's results/ (or HARNESSFACTS_RESULTS_DIR), not the package installation. Run `harnessfacts validate` before submitting them.

OAuth tests, hosted execution, PR previews, scheduled runners, and signed attestations remain deferred. A live site, public repository, published npm packages, and posted contribution issues require external account access and an explicit publication decision.

## GitHub Pages

The public repository is `LouisDeconinck/harnessfacts`. `.github/workflows/pages.yml` checks, builds, and deploys `main` to https://louisdeconinck.github.io/harnessfacts/. GitHub Pages uses the Actions source. Astro uses the repository base path for navigation and evidence links. A custom domain can be configured later with corresponding Astro site/base changes.
