# Replace pull-request body github action

This action looks at the body of a pull-request (created via `PULL_REQUEST_TEMPLATE.md`)
and replaces the variables below with information from the pull-request.

## Available variables

`prNumber`

More to be added in the future.

## Inputs

### `github-token`

**Required** `${{ secrets.GITHUB_TOKEN }}`

## Example usage

Under `.github/PULL_REQUEST_TEMPLATE.md`:

```
Link to review app: http://app-{{prNumber}}.example.com
```

And under `.github/workflows/update-pr-body.yml`

```
name: Update pull-request body
on: [pull_request]

uses: actions/github-action-replace-pr-body@v1
with:
  github-token: "${{ secrets.GITHUB_TOKEN }}"
```