terraform {
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "~> 2.2"
    }
  }
  required_version = ">= 0.13"
}
