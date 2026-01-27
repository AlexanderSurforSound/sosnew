resource "azurerm_redis_cache" "main" {
  name                = "redis-surfsound-${var.environment}-${var.name_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  capacity            = var.capacity
  family              = var.sku_name == "Premium" ? "P" : "C"
  sku_name            = var.sku_name
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
    maxmemory_policy = "allkeys-lru"
  }

  tags = var.tags
}
