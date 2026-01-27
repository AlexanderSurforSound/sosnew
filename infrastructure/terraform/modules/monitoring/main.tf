resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-surfsound-${var.environment}-${var.name_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = var.environment == "prod" ? 90 : 30

  tags = var.tags
}

resource "azurerm_application_insights" "main" {
  name                = "appi-surfsound-${var.environment}-${var.name_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"

  tags = var.tags
}

# Alert for high response time
resource "azurerm_monitor_metric_alert" "response_time" {
  count               = var.environment == "prod" ? 1 : 0
  name                = "alert-surfsound-response-time"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_insights.main.id]
  description         = "Alert when average response time exceeds 3 seconds"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "microsoft.insights/components"
    metric_name      = "requests/duration"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 3000
  }

  tags = var.tags
}

# Alert for high failure rate
resource "azurerm_monitor_metric_alert" "failure_rate" {
  count               = var.environment == "prod" ? 1 : 0
  name                = "alert-surfsound-failure-rate"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_insights.main.id]
  description         = "Alert when request failure rate exceeds 5%"
  severity            = 1
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "microsoft.insights/components"
    metric_name      = "requests/failed"
    aggregation      = "Count"
    operator         = "GreaterThan"
    threshold        = 50
  }

  tags = var.tags
}

# Dashboard
resource "azurerm_portal_dashboard" "main" {
  name                = "dash-surfsound-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags

  dashboard_properties = jsonencode({
    lenses = {
      "0" = {
        order = 0
        parts = {
          "0" = {
            position = { x = 0, y = 0, rowSpan = 4, colSpan = 6 }
            metadata = {
              type = "Extension/HubsExtension/PartType/MonitorChartPart"
              inputs = [
                {
                  name  = "options"
                  value = {
                    chart = {
                      title = "Request Rate"
                      metrics = [{
                        resourceMetadata = { id = azurerm_application_insights.main.id }
                        name             = "requests/count"
                        aggregationType  = 7
                      }]
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  })
}
