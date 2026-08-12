# OsTicketFrontend

osTicket MERN — frontend monorepo.

## Apps

| App        | Directory       | Description                                  |
|------------|-----------------|----------------------------------------------|
| Customer   | `customer/`     | Public portal — single login for all roles   |
| Agent      | `agent/`        | Agent panel                                  |
| Admin      | `admin/`        | Admin panel                                  |
| Superadmin | `superadmin/`   | Superadmin panel                             |

## Single login

All panels sign in through one login page (`/login` on the Customer portal).
After sign-in the portal checks your role and automatically redirects you to
your own dashboard.

- Customer → `/tickets`
- Agent → `/agent`
- Admin → `/admin`
- Superadmin → `/`

## Dev

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
