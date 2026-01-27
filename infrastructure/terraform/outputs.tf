# Resource Group
output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_id" {
  description = "ID of the resource group"
  value       = azurerm_resource_group.main.id
}

# App Service
output "app_service_url" {
  description = "URL of the App Service"
  value       = module.app_service.default_hostname
}

output "app_service_name" {
  description = "Name of the App Service"
  value       = module.app_service.name
}

# SQL Server
output "sql_server_fqdn" {
  description = "Fully qualified domain name of the SQL Server"
  value       = module.sql.server_fqdn
}

output "sql_database_name" {
  description = "Name of the SQL Database"
  value       = module.sql.database_name
}

# Redis
output "redis_hostname" {
  description = "Redis Cache hostname"
  value       = module.redis.hostname
}

# Storage
output "storage_account_name" {
  description = "Name of the Storage Account"
  value       = module.storage.account_name
}

output "storage_primary_blob_endpoint" {
  description = "Primary blob endpoint"
  value       = module.storage.primary_blob_endpoint
}

output "cdn_endpoint" {
  description = "CDN endpoint URL (if enabled)"
  value       = module.storage.cdn_endpoint
}

# SignalR
output "signalr_hostname" {
  description = "SignalR Service hostname"
  value       = module.signalr.hostname
}

# OpenAI
output "openai_endpoint" {
  description = "Azure OpenAI endpoint"
  value       = module.openai.endpoint
}

# Key Vault
output "keyvault_uri" {
  description = "Key Vault URI"
  value       = module.keyvault.vault_uri
}

# Application Insights
output "app_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = module.monitoring.instrumentation_key
  sensitive   = true
}

output "app_insights_connection_string" {
  description = "Application Insights connection string"
  value       = module.monitoring.connection_string
  sensitive   = true
}

# Summary for CI/CD
output "deployment_summary" {
  description = "Summary of deployed resources for CI/CD"
  value = {
    api_url           = "https://${module.app_service.default_hostname}"
    storage_endpoint  = module.storage.primary_blob_endpoint
    cdn_endpoint      = module.storage.cdn_endpoint
    signalr_endpoint  = "https://${module.signalr.hostname}"
  }
}
