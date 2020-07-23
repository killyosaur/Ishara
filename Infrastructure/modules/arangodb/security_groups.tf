resource "aws_security_group" "arangodb_security_group" {
  name   = "arango-${local.app_string}-security-group"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    #cidr_blocks = ["35.128.0.0/16", "10.0.0.0/16"]
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8528
    to_port     = 8531
    protocol    = "tcp"
    self        = true
    #cidr_blocks = ["35.128.0.0/16", "10.0.0.0/16"]
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge({
    Name = "arango-${local.app_string}-ec2"
  }, local.tags)
}

resource "aws_security_group" "arango_elb_sg" {
  name   = "arango-${local.app_string}-elb-security-group"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    #cidr_blocks = ["35.128.0.0/16", "10.0.0.0/16"]
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    self        = true
    #cidr_blocks = ["35.128.0.0/16", "10.0.0.0/16"]
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge({
    Name = "arango-${local.app_string}-elb"
  }, local.tags)

  lifecycle {
    create_before_destroy = true
  }
}
