resource "azurerm_cognitive_account" "openai" {
  name                  = "oai-surfsound-${var.environment}-${var.name_suffix}"
  location              = var.location
  resource_group_name   = var.resource_group_name
  kind                  = "OpenAI"
  sku_name              = "S0"
  custom_subdomain_name = "surfsound-${var.environment}-${var.name_suffix}"

  network_acls {
    default_action = "Allow"
  }

  tags = var.tags
}

# GPT-4o deployment for Sandy AI Concierge
resource "azurerm_cognitive_deployment" "gpt4o" {
  name                 = "gpt-4o"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "gpt-4o"
    version = "2024-05-13"
  }

  scale {
    type     = "Standard"
    capacity = var.environment == "prod" ? 30 : 10
  }
}

# Text embedding model for semantic search
resource "azurerm_cognitive_deployment" "embedding" {
  name                 = "text-embedding-3-small"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "text-embedding-3-small"
    version = "1"
  }

  scale {
    type     = "Standard"
    capacity = var.environment == "prod" ? 120 : 30
  }
}
