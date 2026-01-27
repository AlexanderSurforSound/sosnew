resource "azurerm_mssql_server" "main" {
  name                         = "sql-surfsound-${var.environment}-${var.name_suffix}"
  resource_group_name          = var.resource_group_name
  location                     = var.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_username
  administrator_login_password = var.sql_admin_password
  minimum_tls_version          = "1.2"

  tags = var.tags

  azuread_administrator {
    login_username = "AzureAD Admin"
    object_id      = var.aad_admin_object_id != "" ? var.aad_admin_object_id : null
  }
}

resource "azurerm_mssql_database" "main" {
  name                        = "sqldb-surfsound-${var.environment}"
  server_id                   = azurerm_mssql_server.main.id
  collation                   = "SQL_Latin1_General_CP1_CI_AS"
  max_size_gb                 = var.environment == "prod" ? 250 : 32
  sku_name                    = var.sku_name
  zone_redundant              = var.environment == "prod"
  geo_backup_enabled          = var.environment == "prod"
  storage_account_type        = var.environment == "prod" ? "Geo" : "Local"

  short_term_retention_policy {
    retention_days           = var.environment == "prod" ? 35 : 7
    backup_interval_in_hours = var.environment == "prod" ? 12 : 24
  }

  long_term_retention_policy {
    weekly_retention  = var.environment == "prod" ? "P1W" : null
    monthly_retention = var.environment == "prod" ? "P1M" : null
    yearly_retention  = var.environment == "prod" ? "P1Y" : null
    week_of_year      = var.environment == "prod" ? 1 : null
  }

  tags = var.tags
}

# Allow Azure services
resource "azurerm_mssql_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Allow local development (optional, configure via variable)
resource "azurerm_mssql_firewall_rule" "local_dev" {
  count            = var.environment == "dev" ? 1 : 0
  name             = "LocalDevelopment"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = var.dev_ip_address
  end_ip_address   = var.dev_ip_address
}
