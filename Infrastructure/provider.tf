variable "do_token" {}
variable "do_access_id" {}
variable "do_secret_key" {}

provider "digitalocean" {
    token = var.do_token

    spaces_access_id  = var.do_access_id
    spaces_secret_key = var.do_secret_key
}