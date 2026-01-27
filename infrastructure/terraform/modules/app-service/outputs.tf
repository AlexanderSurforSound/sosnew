output "id" {
  value = azurerm_linux_web_app.api.id
}

output "name" {
  value = azurerm_linux_web_app.api.name
}

output "default_hostname" {
  value = azurerm_linux_web_app.api.default_hostname
}

output "principal_id" {
  value = azurerm_linux_web_app.api.identity[0].principal_id
}

output "outbound_ip_addresses" {
  value = azurerm_linux_web_app.api.outbound_ip_addresses
}
