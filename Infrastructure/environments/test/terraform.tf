provider "aws" {
  region = "us-east-2"
}

locals {
  app_name    = "ishara"
  environment = "test"
}

module "vpc" {
  source = "../../modules/vpc"
  
  environment            = local.environment
  vpc_cidr_block         = "10.0.0.0/16"
  instance_tenancy       = "default"
  app_name               = local.app_name
  ingress_cidr_blocks    = ["0.0.0.0/0"]
  egress_cidr_blocks     = ["0.0.0.0/0"]
  destination_cidr_block = "0.0.0.0/0"
}