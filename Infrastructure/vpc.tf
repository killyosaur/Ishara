resource "digitalocean_vpc" "ishara" {
  name     = "ishara-project-network"
  region   = "nyc3"
  ip_range = "10.110.0.0/19"
}
