terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.85"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  backend "azurerm" {
    # Configure in environments/{env}/backend.tfvars
    # storage_account_name = "sttfsurfsound"
    # container_name       = "tfstate"
    # key                  = "surfsound.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }
  }
}

# Random suffix for globally unique names
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

locals {
  name_suffix = random_string.suffix.result
  common_tags = {
    Project     = "SurfOrSound"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-surfsound-${var.environment}"
  location = var.location
  tags     = local.common_tags
}

# Key Vault - created first for secrets
module "keyvault" {
  source = "./modules/keyvault"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  name_suffix         = local.name_suffix
  tags                = local.common_tags

  # Initial secrets
  secrets = {
    "TrackApiKey"           = var.track_api_key
    "TrackPropertyManagerId" = var.track_property_manager_id
    "SanityToken"           = var.sanity_token
    "JwtKey"                = var.jwt_key
    "RemoteLockClientId"    = var.remotelock_client_id
    "RemoteLockClientSecret" = var.remotelock_client_secret
  }
}

# SQL Server & Database
module "sql" {
  source = "./modules/sql"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  name_suffix         = local.name_suffix
  tags                = local.common_tags

  sql_admin_username = var.sql_admin_username
  sql_admin_password = var.sql_admin_password
  sku_name           = var.sql_sku_name
}

# Redis Cache
module "redis" {
  source = "./modules/redis"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  name_suffix         = local.name_suffix
  tags                = local.common_tags

  sku_name = var.redis_sku_name
  capacity = var.redis_capacity
}

# Storage Account (for blobs, images, etc.)
module "storage" {
  source = "./modules/storage"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  name_suffix         = local.name_suffix
  tags                = local.common_tags

  enable_cdn = var.enable_cdn
}

# SignalR Service
module "signalr" {
  source = "./modules/signalr"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  name_suffix         = local.name_suffix
  tags                = local.common_tags

  sku_name = var.signalr_sku_name
}

# Azure OpenAI (for Sandy AI Concierge)
module "openai" {
  source = "./modules/openai"

  resource_group_name = azurerm_resource_group.main.name
  location            = var.openai_location # OpenAI has limited region availability
  environment         = var.environment
  name_suffix         = local.name_suffix
  tags                = local.common_tags
}

# Application Insights & Monitoring
module "monitoring" {
  source = "./modules/monitoring"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  name_suffix         = local.name_suffix
  tags                = local.common_tags
}

# App Service (API)
module "app_service" {
  source = "./modules/app-service"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  name_suffix         = local.name_suffix
  tags                = local.common_tags

  sku_name = var.app_service_sku_name

  # Connection strings and settings
  sql_connection_string    = module.sql.connection_string
  redis_connection_string  = module.redis.connection_string
  storage_connection_string = module.storage.connection_string
  signalr_connection_string = module.signalr.connection_string
  app_insights_connection_string = module.monitoring.instrumentation_key
  keyvault_uri             = module.keyvault.vault_uri

  # App settings
  app_settings = {
    "Track__BaseUrl"          = "https://api.trackhs.com/v1"
    "Track__PaymentsUrl"      = "https://payments.trackhs.com/v1"
    "Sanity__ProjectId"       = var.sanity_project_id
    "Sanity__Dataset"         = var.sanity_dataset
    "Sanity__ApiVersion"      = "2024-01-01"
    "Jwt__Issuer"             = "SurfOrSound"
    "Jwt__ExpirationDays"     = "7"
    "OpenAI__Endpoint"        = module.openai.endpoint
    "OpenAI__DeploymentName"  = module.openai.deployment_name
    "RemoteLock__BaseUrl"     = "https://api.remotelock.com"
    "ASPNETCORE_ENVIRONMENT"  = var.environment == "prod" ? "Production" : "Development"
  }
}

# Store connection strings in Key Vault
resource "azurerm_key_vault_secret" "sql_connection" {
  name         = "SqlConnectionString"
  value        = module.sql.connection_string
  key_vault_id = module.keyvault.vault_id
}

resource "azurerm_key_vault_secret" "redis_connection" {
  name         = "RedisConnectionString"
  value        = module.redis.connection_string
  key_vault_id = module.keyvault.vault_id
}

resource "azurerm_key_vault_secret" "storage_connection" {
  name         = "StorageConnectionString"
  value        = module.storage.connection_string
  key_vault_id = module.keyvault.vault_id
}

resource "azurerm_key_vault_secret" "signalr_connection" {
  name         = "SignalRConnectionString"
  value        = module.signalr.connection_string
  key_vault_id = module.keyvault.vault_id
}

resource "azurerm_key_vault_secret" "openai_key" {
  name         = "OpenAIKey"
  value        = module.openai.primary_key
  key_vault_id = module.keyvault.vault_id
}
