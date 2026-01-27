# Environment
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "openai_location" {
  description = "Azure region for OpenAI (limited availability)"
  type        = string
  default     = "East US"
}

# SQL Server
variable "sql_admin_username" {
  description = "SQL Server admin username"
  type        = string
  sensitive   = true
}

variable "sql_admin_password" {
  description = "SQL Server admin password"
  type        = string
  sensitive   = true
}

variable "sql_sku_name" {
  description = "SQL Database SKU"
  type        = string
  default     = "S2"
}

# Redis
variable "redis_sku_name" {
  description = "Redis Cache SKU (Basic, Standard, Premium)"
  type        = string
  default     = "Basic"
}

variable "redis_capacity" {
  description = "Redis Cache capacity (0-6)"
  type        = number
  default     = 1
}

# App Service
variable "app_service_sku_name" {
  description = "App Service Plan SKU"
  type        = string
  default     = "B2"
}

# SignalR
variable "signalr_sku_name" {
  description = "SignalR Service SKU (Free_F1, Standard_S1)"
  type        = string
  default     = "Free_F1"
}

# CDN
variable "enable_cdn" {
  description = "Enable CDN for static assets"
  type        = bool
  default     = false
}

# Track PMS Integration
variable "track_api_key" {
  description = "Track PMS API Key"
  type        = string
  sensitive   = true
}

variable "track_property_manager_id" {
  description = "Track Property Manager ID"
  type        = string
  sensitive   = true
}

# Sanity CMS
variable "sanity_project_id" {
  description = "Sanity Project ID"
  type        = string
}

variable "sanity_dataset" {
  description = "Sanity Dataset name"
  type        = string
  default     = "production"
}

variable "sanity_token" {
  description = "Sanity API Token"
  type        = string
  sensitive   = true
}

# JWT
variable "jwt_key" {
  description = "JWT signing key (min 32 characters)"
  type        = string
  sensitive   = true
}

# RemoteLock
variable "remotelock_client_id" {
  description = "RemoteLock OAuth Client ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "remotelock_client_secret" {
  description = "RemoteLock OAuth Client Secret"
  type        = string
  sensitive   = true
  default     = ""
}
