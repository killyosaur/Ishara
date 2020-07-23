resource "aws_elb" "elb_arangodb_cluster" {
  name = "elb-${local.app_string}-cluster"

  security_groups = [aws_security_group.arango_elb_sg.id]
  subnets         = data.aws_subnet_ids.private.ids
  internal        = true

  listener {
    instance_port      = 8529
    instance_protocol  = "http"
    lb_port            = 443
    lb_protocol        = "https"
    ssl_certificate_id = var.ssl_arn
  }

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 5
    timeout             = 3
    target              = "HTTP:8529/_db/_system/_admin/aardvark/index.html"
    interval            = 60
  }

  instances = flatten([aws_instance.arango_instance[*].id, aws_instance.arango_parent[*].id, aws_instance.arango_children[*].id])

  cross_zone_load_balancing = true

  tags = merge({
    Name = "elb-${local.app_string}"
  }, local.tags)
}
