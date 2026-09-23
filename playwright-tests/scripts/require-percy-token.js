// Guard for `npm run test:visual`.
//
// Without a token the Percy CLI only warns, still runs the wrapped Playwright
// suite, and exits 0 — a green build with nothing uploaded. This check fails
// before the Percy run starts instead.

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
