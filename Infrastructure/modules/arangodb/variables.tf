variable "instance_type" {
  type = string
}

variable "child_instance_count" {
  type = number
}

variable "key_pair" {
  type = string
}

variable "ssh_key_connection" {
  type = string
}

variable "environment" {
  type = string
}

variable "app_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "ssl_arn" {
  type = string
}

variable "zone_id" {
    type = string
}

variable "domain_name" {
    type = string
}