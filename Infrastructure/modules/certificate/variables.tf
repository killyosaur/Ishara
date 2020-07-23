variable "zone_id" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "subject_alternative_names" {
  type    = list(string)
  default = []
}

variable "environment" {
  type = string
}

variable "app_name" {
  type = string
}
