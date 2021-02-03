provider "kubernetes" {
  host  = digitalocean_kubernetes_cluster.k8s_cluster.endpoint
  token = digitalocean_kubernetes_cluster.k8s_cluster.kube_config[0].token
  
  client_certificate     = base64decode(digitalocean_kubernetes_cluster.k8s_cluster.kube_config[0].client_certificate)
  client_key             = base64decode(digitalocean_kubernetes_cluster.k8s_cluster.kube_config[0].client_key)
  cluster_ca_certificate = base64decode(digitalocean_kubernetes_cluster.k8s_cluster.kube_config[0].cluster_ca_certificate)
}

resource "local_file" "kubeconfig" {
    content  = digitalocean_kubernetes_cluster.k8s_cluster.kube_config[0].raw_config
    filename = "k8s/kubeconfig.yaml"
}

resource "kubernetes_namespace" "anarchy_for_sale" {
  metadata {
    name = "anarchy-for-sale"
  }
}
