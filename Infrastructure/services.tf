resource "random_password" "ishara_secret" {
  length = 64
  special = true
}

resource "kubernetes_secret" "ishara_secret" {
  depends_on = [kubernetes_namespace.anarchy_for_sale]

  metadata {
    name      = "ishara-secret"
    namespace = "anarchy-for-sale"
  }

  data = {
    value = random_password.ishara_secret.result
  }

  type = "Opaque"
}

resources "kubernetes_deployment" "admin_api" {
  metadata {
    name = "anarchyforsale-admin"

    annotations = {}
    labels      = {
      app = "admin-api"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        "app.kubernetes.io/name" = "anarchyforsale-admin"
        app                      = "admin-api"
      }
    }

    template {
      metadata {
        labels = {
          "app.kubernetes.io/name" = "anarchyforsale-admin"
          app                      = "admin-api"
        }
      }

      spec {
        container {
          name  = "admin"
          image = "killyosaur/ishara.admin.api:latest"
          args  = []

          env {
            name  = "DB_PORT"
            value = "8529" 
          }

          env {
            name  = "DB_HOST"
            value = "http+ssl://anarchy-db-cluster" 
          }

          env {
            name = "DB_USER"

            value_from {
              secret_key_ref {
                key  = "username"
                name = kubernetes_secret.ishara_secret.name
              }
            } 
          }

          env {
            name  = "DB_PWRD"

            value_from {
              secret_key_ref {
                key  = "password"
                name = kubernetes_secret.ishara_secret.name
              }
            } 
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

resource "kubernetes_service" "admin_api" {
  metadata {
    name = "anarchyforsale-admin-api"

    annotations = {
      "kubernetes.digitalocean.com/load-balancer-id"         = ""
      "service.beta.kubernetes.io/do-loadbalancer-algorithm" = "least_connections"
      "service.beta.kubernetes.io/do-loadbalancer-hostname"  = "data.killyosaur.net"
      "service.beta.kubernetes.io/do-loadbalancer-name"      = "anarchyforsale-admin-api"
    }
  }

  spec {
    selector = {
      "app.kubernetes.io/name" = "anarchyforsale-admin"
    }
    port {
      port        = 443
      name        = "https"
      target_port = 5000
    }

    type = "LoadBalancer"
  }

  lifecycle {
    ignore_changes = [
      metadata[0].annotations["kubernetes.digitalocean.com/load-balancer-id"],
    ]
  }
}

data "digitalocean_loadbalancer" "admin_api" {
  name = kubernetes_service.admin_api.metadata[0].annotations["service.beta.kubernetes.io/do-loadbalancer-name"]

  depends_on = [kubernetes_service.admin_api]
}

resource "digitalocean_record" "admin_api" {
  domain = digitalocean_domain.default.name
  type   = "A"
  name   = "data"
  value  = data.digitalocean_loadbalancer.admin_api.ip
}