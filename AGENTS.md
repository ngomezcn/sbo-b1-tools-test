# AGENTS.md

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues on ngomezcn/sbo-b1-tools-test, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage labels: needs-triage, needs-info, ready-for-agent, ready-for-human and wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Repository layout

Two repos: this one is the **factory**; `sbo-skills/` is a submodule with the installable product (ADR 0005). Never edit compiled output in `sbo-skills/plugins/*/dist/`; edit `factory/` and rebuild (ADR 0006). Own build skills are `.claude/skills/build-*` and are not in `skills-lock.json`. Docs content shipped in plugins is written in English; repo docs (CONTEXT.md, ADRs) in Spanish.
