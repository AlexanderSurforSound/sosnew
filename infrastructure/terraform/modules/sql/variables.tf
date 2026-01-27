variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "environment" {
  type = string
}

variable "name_suffix" {
  type = string
}

variable "tags" {
  type = map(string)
}

variable "sql_admin_username" {
  type      = string
  sensitive = true
}

variable "sql_admin_password" {
  type      = string
  sensitive = true
}

variable "sku_name" {
  type    = string
  default = "S2"
}

variable "aad_admin_object_id" {
  type    = string
  default = ""
}

variable "dev_ip_address" {
  type    = string
  default = "0.0.0.0"
}
