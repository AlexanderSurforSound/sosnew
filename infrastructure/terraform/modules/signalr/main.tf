resource "azurerm_signalr_service" "main" {
  name                = "signalr-surfsound-${var.environment}-${var.name_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name

  sku {
    name     = var.sku_name
    capacity = var.sku_name == "Free_F1" ? 1 : var.capacity
  }

  connectivity_logs_enabled = true
  messaging_logs_enabled    = var.environment == "prod"
  service_mode              = "Default"

  cors {
    allowed_origins = ["*"]
  }

  upstream_endpoint {
    category_pattern = ["*"]
    event_pattern    = ["*"]
    hub_pattern      = ["*"]
    url_template     = "https://api-surfsound-${var.environment}.azurewebsites.net/api/signalr"
  }

  tags = var.tags
}
