# Web deployment

GitHub Actions deploys the `staging` branch to staging and `main` to production.
Each environment builds the Vite app with its own public API URL, uploads an
immutable release, starts the matching Docker Compose project, then checks
`/healthz`.

Configure GitHub Environment values separately for **staging** and **production**:

| Type | Name | Value |
|---|---|---|
| Secret | `SSH_HOST` | Server hostname or IP |
| Secret | `SSH_USER` | Restricted deployment user |
| Secret | `SSH_PRIVATE_KEY` | Private key for that deployment user |
| Secret | `DEPLOY_PATH` | Separate absolute path, e.g. `/srv/osticket/staging/web` |
| Variable | `SSH_PORT` | `22` unless changed |
| Variable | `WEB_PORT` | Distinct local port, e.g. `3001` staging and `3000` production |
| Variable | `VITE_API_URL` | Public API URL ending in `/api/v1` |

Configure the server reverse proxy so the staging and production web domains route
to their respective `WEB_PORT` values. Configure production deployment approval in
GitHub Environment protection rules. `VITE_API_URL` is public browser configuration,
so never place a secret in it.
