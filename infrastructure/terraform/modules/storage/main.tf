resource "azurerm_storage_account" "main" {
  name                     = "stsurfsound${var.environment}${var.name_suffix}"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = var.environment == "prod" ? "GRS" : "LRS"
  account_kind             = "StorageV2"
  min_tls_version          = "TLS1_2"

  blob_properties {
    versioning_enabled = var.environment == "prod"

    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "HEAD", "OPTIONS"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }

    delete_retention_policy {
      days = var.environment == "prod" ? 30 : 7
    }
  }

  tags = var.tags
}

# Container for property images
resource "azurerm_storage_container" "images" {
  name                  = "images"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}

# Container for property videos
resource "azurerm_storage_container" "videos" {
  name                  = "videos"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}

# Container for documents (contracts, etc.)
resource "azurerm_storage_container" "documents" {
  name                  = "documents"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Container for trip videos (user-generated)
resource "azurerm_storage_container" "trip-videos" {
  name                  = "trip-videos"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# CDN Profile and Endpoint (optional)
resource "azurerm_cdn_profile" "main" {
  count               = var.enable_cdn ? 1 : 0
  name                = "cdn-surfsound-${var.environment}-${var.name_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "Standard_Microsoft"
  tags                = var.tags
}

resource "azurerm_cdn_endpoint" "main" {
  count                     = var.enable_cdn ? 1 : 0
  name                      = "cdn-surfsound-${var.environment}-${var.name_suffix}"
  profile_name              = azurerm_cdn_profile.main[0].name
  location                  = var.location
  resource_group_name       = var.resource_group_name
  origin_host_header        = azurerm_storage_account.main.primary_blob_host
  optimization_type         = "GeneralWebDelivery"
  querystring_caching_behaviour = "IgnoreQueryString"

  origin {
    name      = "storage"
    host_name = azurerm_storage_account.main.primary_blob_host
  }

  tags = var.tags
}
