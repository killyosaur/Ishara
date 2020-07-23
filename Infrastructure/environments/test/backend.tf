terraform {
  backend "s3" {
    bucket = "killyosaur-terraform-state-bucket"
    key    = "test/ishara/terraform.tfstate"
    region = "us-east-2"
  }
}
