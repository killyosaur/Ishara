resource "kubernetes_deployment" "web_api" {
  metadata {
    name      = "anarchyforsale-web"
    namespace = "anarchy-for-sale"

    annotations = {}
    labels = {
      app = "web-api"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        "app.kubernetes.io/name" = "anarchyforsale-web"
        app                      = "web-api"
      }
    }

    template {
      metadata {
        labels = {
          "app.kubernetes.io/name" = "anarchyforsale-web"
          app                      = "web-api"
        }
      }

      spec {
        container {
          name  = "web"
          image = "killyosaur/ishara.api:0.0.6"
          args  = []

          env {
            name  = "DB_PORT"
            value = "8529"
          }

          env {
            name  = "DB_HOST"
            value = "https://anarchy-db.anarchy-for-sale.svc"
          }

          env {
            name = "DB_USER"

            value_from {
              secret_key_ref {
                key  = "username"
                name = kubernetes_secret.root_application_password.metadata[0].name
              }
            }
          }

          env {
            name = "DB_PWRD"

            value_from {
              secret_key_ref {
                key  = "password"
                name = kubernetes_secret.root_application_password.metadata[0].name
              }
            }
          }

          volume_mount {
            mount_path = "/etc/ssl/certs/anarchy-db.pem"
            name       = "ca-cert"
            sub_path   = "ca.crt"
            read_only  = false
          }

          port {
            container_port = 5001
            protocol       = "TCP"
          }
        }

        volume {
          name = "ca-cert"
          secret {
            secret_name = "anarchy-db-ca"
          }
        }
        
        node_selector = {}
      }
    }
  }

  wait_for_rollout = false

  lifecycle {
    ignore_changes = [
      spec[0].template[0].spec[0].active_deadline_seconds,
      spec[0].template[0].spec[0].automount_service_account_token,
      spec[0].template[0].spec[0].container[0].command,
    ]
  }
}

resource "kubernetes_service" "web_api" {
  metadata {
    name      = "anarchyforsale-web-api"
    namespace = "anarchy-for-sale"

    annotations = {
      "kubernetes.digitalocean.com/load-balancer-id"                      = ""
      "service.beta.kubernetes.io/do-loadbalancer-algorithm"              = "least_connections"
      "service.beta.kubernetes.io/do-loadbalancer-hostname"               = "data.anarchyforsale.com"
      "service.beta.kubernetes.io/do-loadbalancer-name"                   = "anarchyforsale-web-api"
      "service.beta.kubernetes.io/do-loadbalancer-tls-ports"              = "443"
      "service.beta.kubernetes.io/do-loadbalancer-protocol"               = "http"
      "service.beta.kubernetes.io/do-loadbalancer-certificate-id"         = digitalocean_certificate.web_api.uuid
      "service.beta.kubernetes.io/do-loadbalancer-redirect-http-to-https" = "true"
    }
  }

  spec {
    selector = {
      "app.kubernetes.io/name" = "anarchyforsale-web"
    }
    port {
      port        = 443
      name        = "https"
      target_port = 5001
      protocol    = "TCP"
    }
    port {
      port        = 80
      name        = "http"
      target_port = 5001
      protocol    = "TCP"
    }

    type = "LoadBalancer"
  }

  lifecycle {
    ignore_changes = [
      metadata[0].annotations["kubernetes.digitalocean.com/load-balancer-id"],
    ]
  }
}

data "digitalocean_loadbalancer" "web_api" {
  name = kubernetes_service.web_api.metadata[0].annotations["service.beta.kubernetes.io/do-loadbalancer-name"]

  depends_on = [kubernetes_service.web_api]
}

resource "digitalocean_certificate" "web_api" {
  name    = "data-anarchyforsale-com"
  type    = "lets_encrypt"
  domains = ["data.anarchyforsale.com"]
}

resource "digitalocean_record" "web_api" {
  domain = digitalocean_domain.ishara.name
  type   = "A"
  name   = "data"
  value  = data.digitalocean_loadbalancer.web_api.ip
}
