locals {
  arango_helm_version = "1.1.3"
  admin_subdomain     = substr(random_uuid.admin_root.result, 0, 8)
  admin_url           = "${local.admin_subdomain}.killyosaur.net"
}

resource "random_uuid" "admin_root" {}