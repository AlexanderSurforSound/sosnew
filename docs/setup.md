# Getting Started

Hey! Here's how to get the project running on your machine.

## You'll need

- Node 18+
- .NET 8
- SQL Server (local or Azure)

## Quick start

```bash
npm install

# Set up your env files (copy the examples and fill in real values)
cp apps/web/.env.example apps/web/.env.local

# Start everything
npm run dev
```

That's it. The web app runs at http://localhost:3000.

## Running the API separately

```bash
cd services/api/SurfOrSound.API
dotnet run
```

The API will be at http://localhost:5000. Swagger docs are at /swagger.

## Useful commands

- `npm run dev` - run all the apps
- `npm run build` - build for production
- `npm run lint` - check for issues
