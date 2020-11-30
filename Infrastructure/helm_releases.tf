provider "helm" {
    debug = true

    kubernetes {
        host  = digitalocean_kubernetes_cluster.k8s_cluster.endpoint
        token = digitalocean_kubernetes_cluster.k8s_cluster.kube_config[0].token

        client_certificate     = base64decode(digitalocean_kubernetes_cluster.k8s_cluster.kube_config[0].client_certificate)
        client_key             = base64decode(digitalocean_kubernetes_cluster.k8s_cluster.kube_config[0].client_key)
        cluster_ca_certificate = base64decode(digitalocean_kubernetes_cluster.k8s_cluster.kube_config[0].cluster_ca_certificate)
    }
}

resource "helm_release" "arangodb_crd_operator" {
    depends_on = [digitalocean_kubernetes_cluster.k8s_cluster, kubernetes_namespace.anarchy_for_sale]

    name  = "afs-crd"
    chart = "https://github.com/arangodb/kube-arangodb/releases/download/${local.arango_helm_version}/kube-arangodb-crd-${local.arango_helm_version}.tgz"

    namespace    = "anarchy-for-sale"
    force_update = true
}

resource "helm_release" "arangodb_operator" {
    depends_on = [helm_release.arangodb_crd_operator, kubernetes_namespace.anarchy_for_sale]
    
    name  = "afs-op"
    chart = "https://github.com/arangodb/kube-arangodb/releases/download/${local.arango_helm_version}/kube-arangodb-${local.arango_helm_version}.tgz"

    namespace    = "anarchy-for-sale"
    force_update = true
}
