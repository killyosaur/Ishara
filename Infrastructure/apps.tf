resource "digitalocean_app" "ishara_blog" {
    spec {
        name    = "ishara-blog"
        region  = "nyc3"
        domains = ["anarchyforsale.com"]

        static_site {
            name           = "web"
            build_command  = "npm run build"
            source_dir     = "ishara.web"
            output_dir     = "build"
            index_document = "index.html"

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
                value = "https://data.anarchyforsale.com"
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

resource "digitalocean_app" "ishara_admin" {
    spec {
        name    = "ishara-admin"
        region  = "nyc3"
        domains = ["maintenance.killyosaur.net"]

        static_site {
            name           = "web"
            build_command  = "npm run build"
            source_dir     = "ishara.admin.web"
            output_dir     = "build"
            index_document = "index.html"

            github {
                branch         = "main"
                deploy_on_push = true
                repo           = "killyosaur/Ishara"
            }

            routes {
                path = "/"
            }

            env {
                key   = "REACT_APP_ADMIN_API"
                value = "https://data.killyosaur.net"
                scope = "BUILD_TIME"
                type  = "GENERAL"
            }
        }
    }
}
