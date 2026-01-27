output "id" {
  value = azurerm_signalr_service.main.id
}

output "hostname" {
  value = azurerm_signalr_service.main.hostname
}

output "primary_access_key" {
  value     = azurerm_signalr_service.main.primary_access_key
  sensitive = true
}

output "connection_string" {
  value     = azurerm_signalr_service.main.primary_connection_string
  sensitive = true
}
