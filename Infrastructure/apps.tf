resource "digitalocean_record" "ishara_blog" {
  domain = digitalocean_domain.ishara.name
  type   = "CNAME"
  name   = "blog"
  value  = "${trimprefix(digitalocean_app.ishara_blog.default_ingress, "https://")}."
}

resource "digitalocean_app" "ishara_blog" {
  spec {
    name    = "ishara-blog"
    region  = "nyc3"
    domains = ["blog.anarchyforsale.com"]

    static_site {
      name              = "web"
      build_command     = "npm run build"
      source_dir        = "ishara.web"
      output_dir        = "build"
      index_document    = "index.html"
      catchall_document = "index.html"

      github {
        branch         = "main"
        deploy_on_push = true
        repo           = "killyosaur/Ishara"
      }

      routes {
        path = "/"
      }

      env {
        key   = "REACT_APP_API"
        value = "https://data.anarchyforsale.com/api"
        scope = "BUILD_TIME"
        type  = "GENERAL"
      }

      env {
        key   = "REACT_APP_PAGE_COUNT"
        value = 10
        scope = "BUILD_TIME"
        type  = "GENERAL"
      }

      env {
        key   = "REACT_APP_DATE_FORMAT"
        value = "yyyy-MM-dd HH:mm:ss"
        scope = "BUILD_TIME"
        type  = "GENERAL"
      }
    }
  }
}

resource "digitalocean_record" "ishara_admin" {
  domain = digitalocean_domain.default.name
  type   = "CNAME"
  name   = local.admin_subdomain
  value  = "${trimprefix(digitalocean_app.ishara_admin.default_ingress, "https://")}."
}

resource "digitalocean_app" "ishara_admin" {
  spec {
    name    = "ishara-admin"
    region  = "nyc3"
    domains = [local.admin_url]

    static_site {
      name              = "web"
      build_command     = "npm run build"
      source_dir        = "ishara.admin.web"
      output_dir        = "build"
      index_document    = "index.html"
      catchall_document = "index.html"

      github {
        branch         = "main"
        deploy_on_push = true
        repo           = "killyosaur/Ishara"
      }

      routes {
        path = "/"
      }

      #routes {
      #  path = "/login"
      #}
#
      #routes {
      #  path = "/user"
      #}
#
      #routes {
      #  path = "/post"
      #}

      env {
        key   = "REACT_APP_ADMIN_API"
        value = "https://data.killyosaur.net/api"
        scope = "BUILD_TIME"
        type  = "GENERAL"
      }
    }
  }
}

output "admin_url" {
  value = local.admin_url
}

output "admin_app_url" {
  value = digitalocean_app.ishara_admin.live_url
}

output "blog_app_url" {
  value = digitalocean_app.ishara_blog.live_url
}

output "admin_app_ingress" {
  value = digitalocean_app.ishara_admin.default_ingress
}

output "blog_app_ingress" {
  value = digitalocean_app.ishara_blog.default_ingress
}
