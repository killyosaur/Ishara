resource "random_password" "root_password" {
  length = 32
  special = true
  override_special = "_%@"
}

resource "random_password" "root_application_password" {
  length = 32
  special = true
  override_special = "_%@"
}

resource "kubernetes_secret" "root_password" {
  depends_on = [kubernetes_namespace.anarchy_for_sale]

  metadata {
    name      = "arango-root"
    namespace = "anarchy-for-sale"
  }

  data = {
    username = "root"
    password = random_password.root_password.result
  }

  type = "kubernetes.io/basic-auth"
}

resource "kubernetes_secret" "root_application_password" {
  depends_on = [kubernetes_namespace.anarchy_for_sale]

  metadata {
    name      = "application-root"
    namespace = "anarchy-for-sale"
  }

  data = {
    username = "app_root"
    password = random_password.root_application_password.result
  }

  type = "kubernetes.io/basic-auth"
}
