# simple-readme-audit

Warn when code or version files change but README is not updated.

## Usage

```yaml
name: Simple Readme Audit
on:
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  simple-readme-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dmytropaduchak/simple-readme-audit@v0.1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `github-token` | `${{ github.token }}` | Token for PR API + sticky comment |
| `fail-on` | `none` | `none` / `medium` / `high` |

## Develop

```bash
npm install && npm run build
```
