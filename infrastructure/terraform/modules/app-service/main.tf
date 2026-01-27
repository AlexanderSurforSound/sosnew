resource "azurerm_service_plan" "main" {
  name                = "plan-surfsound-${var.environment}-${var.name_suffix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = var.sku_name

  tags = var.tags
}

resource "azurerm_linux_web_app" "api" {
  name                = "api-surfsound-${var.environment}-${var.name_suffix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.main.id

  https_only = true

  site_config {
    always_on                         = var.sku_name != "B1" && var.sku_name != "F1"
    http2_enabled                     = true
    minimum_tls_version               = "1.2"
    health_check_path                 = "/health"
    health_check_eviction_time_in_min = 5

    application_stack {
      dotnet_version = "8.0"
    }

    cors {
      allowed_origins     = var.environment == "prod" ? ["https://surfsound.com", "https://www.surfsound.com", "https://admin.surfsound.com"] : ["http://localhost:3000", "http://localhost:3001", "https://*.vercel.app"]
      support_credentials = true
    }
  }

  app_settings = merge(var.app_settings, {
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.app_insights_connection_string
    "ApplicationInsightsAgent_EXTENSION_VERSION" = "~3"
    "ASPNETCORE_FORWARDEDHEADERS_ENABLED"   = "true"
  })

  connection_string {
    name  = "DefaultConnection"
    type  = "SQLAzure"
    value = var.sql_connection_string
  }

  connection_string {
    name  = "Redis"
    type  = "Custom"
    value = var.redis_connection_string
  }

  connection_string {
    name  = "Storage"
    type  = "Custom"
    value = var.storage_connection_string
  }

  connection_string {
    name  = "SignalR"
    type  = "Custom"
    value = var.signalr_connection_string
  }

  identity {
    type = "SystemAssigned"
  }

  sticky_settings {
    app_setting_names = [
      "ASPNETCORE_ENVIRONMENT",
    ]
  }

  logs {
    detailed_error_messages = true
    failed_request_tracing  = true

    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 35
      }
    }

    application_logs {
      file_system_level = "Information"
    }
  }

  tags = var.tags
}

# Key Vault access policy for the App Service
resource "azurerm_key_vault_access_policy" "api" {
  key_vault_id = data.azurerm_key_vault.main.id
  tenant_id    = azurerm_linux_web_app.api.identity[0].tenant_id
  object_id    = azurerm_linux_web_app.api.identity[0].principal_id

  secret_permissions = [
    "Get",
    "List",
  ]
}

data "azurerm_key_vault" "main" {
  name                = split("/", var.keyvault_uri)[2]
  resource_group_name = var.resource_group_name
}

# Staging slot for zero-downtime deployments
resource "azurerm_linux_web_app_slot" "staging" {
  count          = var.environment == "prod" ? 1 : 0
  name           = "staging"
  app_service_id = azurerm_linux_web_app.api.id

  site_config {
    always_on         = true
    http2_enabled     = true
    health_check_path = "/health"

    application_stack {
      dotnet_version = "8.0"
    }
  }

  app_settings = merge(var.app_settings, {
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.app_insights_connection_string
    "ASPNETCORE_ENVIRONMENT"                = "Staging"
  })

  tags = var.tags
}
