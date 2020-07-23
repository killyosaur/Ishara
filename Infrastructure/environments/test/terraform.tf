provider "aws" {
  region = "us-east-2"
}

locals {
  app_name    = "ishara"
  environment = "test"
}

resource "tls_private_key" "private_key" {
  algorithm = "RSA"
}

resource "aws_key_pair" "arango_key" {
  key_name   = "${local.environment}_arangodb_key"
  public_key = tls_private_key.private_key.public_key_openssh

  tags = {
    app-name    = local.app_name
    environment = local.environment
  }
}

resource "local_file" "ssh_pem" {
    content  = tls_private_key.private_key.private_key_pem
    filename = "${path.module}/${aws_key_pair.arango_key.key_name}.pem"
}

data "aws_route53_zone" "selected" {
  name         = "killyosaur.net."
  private_zone = false
}

module "certificate" {
  source = "../../modules/certificate"

  zone_id     = data.aws_route53_zone.selected.zone_id
  domain_name = "arango.${local.environment}.killyosaur.net"
  environment = local.environment
  app_name    = local.app_name
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

module "arango_db" {
  source = "../../modules/arangodb"

  vpc_id = module.vpc.vpc_id

  instance_type        = "t2.micro"
  environment          = local.environment
  child_instance_count = 0
  app_name             = local.app_name

  key_pair           = aws_key_pair.arango_key.key_name
  ssh_key_connection = "${path.module}/${aws_key_pair.arango_key.key_name}.pem"

  ssl_arn = module.certificate.cert_arn

  zone_id     = data.aws_route53_zone.selected.zone_id
  domain_name = "arango.${local.environment}.killyosaur.net"
}
