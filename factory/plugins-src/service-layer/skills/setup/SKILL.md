---
name: setup
description: Set up or reset the connection to SAP Business One Service Layer for this repo - B1 version, OData version and the credentials of dev, uat or prod, with a login test. Use when the developer asks to configure, reconfigure or reset Service Layer, or when a Service Layer command fails with SETUP_MISSING or ENVIRONMENT_NOT_CONFIGURED. The developer types the credentials in their own terminal; this skill never handles them.
---

# Service Layer: setup

The Setup is a script that asks the developer for everything and tests the login of each environment. **You do not run it and you never see the credentials**: URL, company, user and password are typed by the developer in their own terminal, so they never enter this conversation.

## Steps

1. Tell the developer what the Setup will ask: the B1 version, the OData version (`v2` is preselected from FP 2405, `v1` before), and, for each of dev, uat and prod that they want, the Service Layer URL, company database, user and password. At least one environment. Each run erases the previous setup, with its data and object contexts, and starts from scratch.
2. Ask them to open **their own terminal** in the root of this repo and run:

   ```
   node "${CLAUDE_PLUGIN_ROOT}/dist/setup.mjs"
   ```

   Give the developer the path already expanded (that is where this plugin is installed); the variable is only set inside Claude Code, not in their terminal.

   Do not run it yourself: it needs an interactive terminal (through your tools it stops with `NEEDS_TERMINAL`), and anything typed into it would pass through this conversation.
3. Wait until the developer says it finished. Then run `node "${CLAUDE_PLUGIN_ROOT}/dist/setup.mjs" --status`. It answers `ok`, `versionB1`, `versionOData` and the configured `environments`, never credentials. Compare with what the developer asked for: an environment whose login failed is not configured and is missing from the list; tell the developer to run the Setup again.
4. If the developer says `.gitignore` could not be updated, ask them to add the line `.sbo-skills/` themselves: the folder holds passwords in plain text.

## Rules

- Never ask the developer to paste a URL, user, password or any credential in the chat. If they paste one, do not repeat or store it, and tell them to run the Setup in their terminal instead.
- Never read, print or edit `.sbo-skills/service-layer/*/credentials.json`.
- Do not create `config.md` or `credentials.json` by hand, and do not use the non-interactive flags of the script (`--b1`, `--dev-url`, `SBO_SL_PASSWORD_*`): they put the password where this conversation can see it.
- The B1 version outside the list is accepted with a warning ("not tested, it does not have to fail"). The OData version is the developer's choice, also one their B1 version may not support.
- Certificates are never validated (self-signed ones are the norm). The developer should work from a network they trust.

## Limits of this design

- The developer opens a terminal and runs a command: one extra step, in exchange for the credentials never entering the AI context.
- The password stays in plain text in `.sbo-skills/service-layer/<environment>/credentials.json` (ignored by git). Anyone who can read the repo folder can read it.
- You cannot see why a login failed; the script shows the Service Layer error to the developer in their terminal.
