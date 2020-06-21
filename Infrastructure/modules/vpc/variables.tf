variable "environment" {
  type    = string
  default = "dev"
}

variable "vpc_cidr_block" {
  type = string
}

variable "instance_tenancy" {
  type = string
}

variable "app_name" {
  type = string
}

variable "ingress_cidr_blocks" {
  type = list(string)  
}

variable "egress_cidr_blocks" {
  type = list(string)  
}
variable "destination_cidr_block" {
  type = string
}
