data "digitalocean_kubernetes_versions" "current" {
  version_prefix = "1.19."
}

# Create a tag for LB
resource "digitalocean_tag" "expose_lb" {
  name = "expose-lb"
}

resource "digitalocean_kubernetes_cluster" "k8s_cluster" {
  name   = "killyosaur-cluster"
  region = "nyc3"

  auto_upgrade = true
  version      = data.digitalocean_kubernetes_versions.current.latest_version

  node_pool {
    name       = "anarchy-for-sale-scaler"
    size       = "s-2vcpu-2gb"
    auto_scale = true
    min_nodes  = 1
    max_nodes  = 2
    tags       = [digitalocean_tag.expose_lb.id]
  }

  vpc_uuid = digitalocean_vpc.ishara.id
}

output "kube_config" {
  value = digitalocean_kubernetes_cluster.k8s_cluster.kube_config
}

output "endpoint" {
  value = digitalocean_kubernetes_cluster.k8s_cluster.endpoint
}
