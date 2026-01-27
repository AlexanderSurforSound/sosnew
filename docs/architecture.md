# How it all fits together

This is a vacation rental platform for Hatteras Island properties.

## The big picture

```
Users (web, mobile apps)
        ↓
    .NET API (on Azure)
        ↓
  ┌─────┼─────┐
  ↓     ↓     ↓
 SQL  Redis  SignalR
(data)(cache)(realtime)
```

We also pull data from a few external services:
- **Track** - the property management system (bookings, availability, payments)
- **Sanity** - CMS for marketing content and property descriptions
- **RemoteLock** - smart locks for the properties

## Folder structure

Here's where stuff lives:

```
apps/
  web/        ← main website (Next.js)
  admin/      ← internal dashboard
  guest-app/  ← mobile app for guests
  owner-app/  ← mobile app for property owners
  sanity/     ← CMS studio

packages/
  ui/         ← shared React components
  types/      ← TypeScript types
  utils/      ← helper functions

services/
  api/        ← the .NET backend

infrastructure/
  terraform/  ← Azure resources
```

## Tech choices

- **Next.js 14** for the websites (using app router)
- **React Native + Expo** for mobile
- **.NET 8** for the API
- **Azure** for hosting (SQL, Redis, SignalR, App Service)
- **Tailwind** for styling
