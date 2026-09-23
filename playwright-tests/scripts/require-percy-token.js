// Guard for `npm run test:visual`.
//
// The gate is two-stage, both stages run before any Playwright test executes:
//
//   1. this script — PERCY_TOKEN is present at all.
//   2. `percy doctor --quick` — the token actually authenticates. A token that
//      is present but expired or revoked only makes the CLI warn, after which
//      it still runs the wrapped suite and exits 0: a green build with nothing
//      uploaded.
//
// Either stage failing stops the command with a non-zero exit status.

const token = (process.env.PERCY_TOKEN || '').trim();

if (!token) {
  process.stderr.write(
    [
      '',
      'PERCY_TOKEN is not set, so "npm run test:visual" cannot upload snapshots.',
      '',
      'Set the token for this shell and re-run:',
      '  PowerShell:  $env:PERCY_TOKEN = "<percy project token>"',
      '  bash:        export PERCY_TOKEN="<percy project token>"',
      '',
      'To create snapshots locally without uploading:  npm run test:visual:dry-run',
      ''
    ].join('\n')
  );

  process.exit(1);
}
