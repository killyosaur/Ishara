locals {
  tags = {
    Module      = "VPC"
    Environment = var.environment
  }

  app_string = "${var.environment}-${var.app_name}"
}

resource "aws_vpc" "network" {
  cidr_block           = var.vpc_cidr_block
  instance_tenancy     = var.instance_tenancy
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge({
    Name = "vpc-${local.app_string}"
  }, local.tags)
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_subnet" "public_network_subnets" {
  count = length(data.aws_availability_zones.available.names)

  vpc_id                  = aws_vpc.network.id
  cidr_block              = "10.0.${count.index}.0/24"
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[count.index]

  tags = merge({
    Name = "public-${local.app_string}-${data.aws_availability_zones.available.names[count.index]}"
    Tier = "Public"
  }, local.tags)
}

resource "aws_subnet" "private_network_subnets" {
  count = length(data.aws_availability_zones.available.names)

  vpc_id                  = aws_vpc.network.id
  cidr_block              = "10.0.${count.index + 3}.0/24"
  map_public_ip_on_launch = false
  availability_zone       = data.aws_availability_zones.available.names[count.index]

  tags = merge({
    Name = "private-${local.app_string}-${data.aws_availability_zones.available.names[count.index]}"
    Tier = "Private"
  }, local.tags)
}

resource "aws_security_group" "network_security_group" {
  vpc_id      = aws_vpc.network.id
  name        = "secgroup-${local.app_string}"
  description = "security group for ${local.app_string}"

  ingress {
    cidr_blocks = var.ingress_cidr_blocks
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = var.ingress_cidr_blocks
  }

  tags = merge({
    Name = "sg-${local.app_string}"
  }, local.tags)
}

# create VPC Network access control list
resource "aws_network_acl" "network_security_acl" {
  vpc_id     = aws_vpc.network.id
  subnet_ids = aws_subnet.public_network_subnets[*].id

  # allow ingress port 22
  ingress {
    protocol   = "tcp"
    rule_no    = 100
    action     = "allow"
    cidr_block = var.destination_cidr_block
    from_port  = 22
    to_port    = 22
  }

  # allow ingress port 80
  ingress {
    protocol   = "tcp"
    rule_no    = 200
    action     = "allow"
    cidr_block = var.destination_cidr_block
    from_port  = 80
    to_port    = 80
  }

  # allow ingress ephemeral ports
  ingress {
    protocol   = "tcp"
    rule_no    = 300
    action     = "allow"
    cidr_block = var.destination_cidr_block
    from_port  = 1024
    to_port    = 65535
  }

  # allow egress port 22
  egress {
    protocol   = "tcp"
    rule_no    = 100
    action     = "allow"
    cidr_block = var.destination_cidr_block
    from_port  = 22
    to_port    = 22
  }

  # allow egress port 80
  egress {
    protocol   = "tcp"
    rule_no    = 200
    action     = "allow"
    cidr_block = var.destination_cidr_block
    from_port  = 80
    to_port    = 80
  }

  # allow egress ephemeral ports
  egress {
    protocol   = "tcp"
    rule_no    = 300
    action     = "allow"
    cidr_block = var.destination_cidr_block
    from_port  = 1024
    to_port    = 65535
  }

  tags = merge({
    Name = "Network ACL ${var.environment}"
  }, local.tags)
}

resource "aws_internet_gateway" "network_gateway" {
  vpc_id = aws_vpc.network.id

  tags = merge({
    Name = "Network Internet Gateway ${var.environment}"
  }, local.tags)
}

resource "aws_route_table" "network_route_table" {
  vpc_id = aws_vpc.network.id

  tags = merge({
    Name = "Route Table ${var.environment}"
  }, local.tags)
}

# Create the Internet Access
resource "aws_route" "network_internet_access" {
  route_table_id         = aws_route_table.network_route_table.id
  destination_cidr_block = var.destination_cidr_block
  gateway_id             = aws_internet_gateway.network_gateway.id
}

resource "aws_route_table_association" "network_association_public" {
  count = length(aws_subnet.public_network_subnets[*].id)

  route_table_id = aws_route_table.network_route_table.id
  subnet_id      = aws_subnet.public_network_subnets[count.index].id
}


resource "aws_route_table_association" "network_association_private" {
  count = length(aws_subnet.private_network_subnets[*].id)

  route_table_id = aws_route_table.network_route_table.id
  subnet_id      = aws_subnet.private_network_subnets[count.index].id
}
