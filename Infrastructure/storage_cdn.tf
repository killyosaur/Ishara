#resource "digitalocean_spaces_bucket" "static" {
#    name   = "anarchy-static"
#    region = "nyc3"
#    acl    = "public-read"
#}
#
#resource "digitalocean_cdn" "static" {
#    origin           = digitalocean_spaces_bucket.static.bucket_domain_name
#    custom_domain    = "static.anarchyforsale.com"
#    certificate_name = digitalocean_certificate.static_cert.name
#}
#
#resource "digitalocean_certificate" "static_cert" {
#  name    = "cdn-static-cert"
#  type    = "lets_encrypt"
#  domains = [
#      "static.anarchyforsale.com"
#    ]
#
#  depends_on = [ digitalocean_domain.ishara ]
#}
#