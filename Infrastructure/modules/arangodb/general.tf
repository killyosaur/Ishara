locals {
  app_string = "${var.environment}-${var.app_name}"

  jwtToken = "${var.environment}.jwt"

  tags = {
    environment = var.environment
    module      = "ArangoDb"
    app-name    = var.app_name
  }
}

data "aws_subnet_ids" "private" {
  vpc_id = var.vpc_id

  tags = {
    Tier = "Private"
  }
}
