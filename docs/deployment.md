# Deploying

We use Vercel for the frontend and Azure for the backend.

## Frontend (automatic)

Just push your code:
- Push to `develop` → goes to staging automatically
- Push to `main` → goes to production

Vercel handles the rest.

## Backend API

The API runs on Azure App Service. GitHub Actions builds and deploys it when you push.

If you need to deploy manually:
```bash
cd services/api/SurfOrSound.API
dotnet publish -c Release
```

Then deploy the output to Azure however you prefer (CLI, portal, etc).

## Infrastructure changes

We use Terraform for Azure resources. If you need to add/change infra:

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

## Secrets

These need to be set in your CI/CD environment:
- Track API credentials (from Track PMS)
- Sanity token
- JWT signing key
- Database connection string

Check the GitHub repo settings for the current secrets.
