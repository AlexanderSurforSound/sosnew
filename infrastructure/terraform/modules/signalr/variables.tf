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

variable "sku_name" {
  type    = string
  default = "Free_F1"
}

variable "capacity" {
  type    = number
  default = 1
}
