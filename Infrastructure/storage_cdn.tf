resource "digitalocean_spaces_bucket" "blog" {
    name   = "anarchy-blog"
    region = "nyc3"
    acl    = "public-read"
}

resource "digitalocean_cdn" "blog" {
    origin           = digitalocean_spaces_bucket.blog.bucket_domain_name
    custom_domain    = "blog.anarchyforsale.com"
    certificate_name = digitalocean_certificate.blog_cert.name
}

resource "digitalocean_spaces_bucket" "static" {
    name   = "anarchy-static"
    region = "nyc3"
    acl    = "public-read"
}

resource "digitalocean_cdn" "static" {
    origin           = digitalocean_spaces_bucket.static.bucket_domain_name
    custom_domain    = "static.anarchyforsale.com"
    certificate_name = digitalocean_certificate.static_cert.name
}

resource "digitalocean_certificate" "static_cert" {
  name    = "cdn-static-cert"
  type    = "lets_encrypt"
  domains = [
      "static.anarchyforsale.com"
    ]

  depends_on = [ digitalocean_domain.ishara ]
}

resource "digitalocean_certificate" "blog_cert" {
  name    = "cdn-blog-cert"
  type    = "lets_encrypt"
  domains = [
      "blog.anarchyforsale.com"
    ]

  depends_on = [ digitalocean_domain.ishara ]
}

resource "digitalocean_spaces_bucket" "admin" {
    name   = "anarchy-admin"
    region = "nyc3"
    acl    = "public-read"
}

resource "digitalocean_cdn" "admin" {
    origin           = digitalocean_spaces_bucket.admin.bucket_domain_name
    custom_domain    = "maintenance.killyosaur.net"
    certificate_name = digitalocean_certificate.admin_cert.name
}

resource "digitalocean_certificate" "admin_cert" {
  name    = "cdn-admin-cert"
  type    = "lets_encrypt"
  domains = [
      "maintenance.killyosaur.net"
    ]

  depends_on = [ digitalocean_domain.default ]
}
