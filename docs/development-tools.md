# Development tools

Assessed on 2026-09-08 for the public Apache-2.0 repository. Use ongoing free
offerings only; no trial, payment details, or paid subscription is needed for
the selected setup.

| Tool | Decision |
| --- | --- |
| [GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions) | Keep existing standard hosted CI and Pages. Quality CI now prints Bun coverage. |
| [GitHub security](https://docs.github.com/en/billing/concepts/product-billing/github-advanced-security) | Enable CodeQL default setup and Dependabot alerts/security updates. Secret scanning and push protection were already enabled. Add PR dependency review for high/critical findings, including development dependencies. |
| [CodeRabbit](https://www.coderabbit.ai/oss) | Existing GitHub App access includes this repository. Configure automatic free public-repository reviews with the project rules in `.coderabbit.yaml`. Reviews run on subsequent PRs; installation is not evidence that a review has completed. |
| [Renovate Community Cloud](https://docs.mend.io/renovate/latest/mend-renovate-cloud-resource-tiers) | Free, but skip a second dependency bot: native Dependabot now supports our text `bun.lock`. Weekly Bun and Actions updates are configured in `.github/dependabot.yml`; major Bun dependency updates remain separate. |
| [Codacy](https://www.codacy.com/pricing) | Has an ongoing free OSS offering. Defer: overlaps with Biome, TypeScript, CodeQL, and CodeRabbit. |
| [SonarQube Cloud OSS](https://docs.sonarsource.com/sonarqube-cloud/administering-sonarcloud/managing-subscription/subscription-plans) | Has a dedicated public-project OSS plan. Defer for the same overlap; no extra analysis service needed now. |
| [Codecov](https://about.codecov.io/pricing/) / [Coveralls](https://docs.coveralls.io/faq) | Free public-repository coverage services. Defer until PR coverage history is useful; Bun coverage in CI provides an initial view without another integration. |
| [Mergify](https://mergify.com/pricing) | Has a free OSS plan. Defer until concurrent PR traffic creates a merge-queue need. |
| [Read the Docs Community](https://about.readthedocs.com/pricing/) | Ongoing free, ad-supported OSS hosting. Skip: repository docs and the existing static Pages site cover this need. |

## Limits and maintenance

- CodeQL uses GitHub's default setup, standard runners, JavaScript/TypeScript and
  Actions analysis, weekly scanning, and local as well as remote input sources.
  Settings live in GitHub, so no duplicate CodeQL workflow is needed.
  Its initial scan completed and raised 16 path-injection alerts for review;
  these are untriaged scanner findings, not confirmed vulnerabilities.
- Dependency review covers dependencies recognized by GitHub's dependency graph.
  [Its supported formats](https://docs.github.com/en/code-security/reference/supply-chain-security/dependency-graph-supported-package-ecosystems)
  do not currently list `bun.lock`; do not assume complete transitive coverage.
  [Dependabot's Bun version-update support](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories)
  is a separate capability. Run `bun audit --audit-level high` for lockfile advisory checks.
- The initial audit reported high-severity advisories for Astro and transitive
  sharp. Enabling these tools does not resolve those dependencies or establish
  that the static deployed site is affected. Review dependency updates separately.
- Bun code coverage measures the harness checks, not agent capability coverage.
  It excludes no failures and creates no conformance observations.
- No auto-merge or new required branch-protection checks are configured. Review
  dependency PRs and keep Bun runtime pins in `package.json` and CI consistent.
- CI uses no manually supplied secrets or vendor tokens. Keep the repository
  public to retain the selected public-repository benefits.
