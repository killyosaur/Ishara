terraform {
    backend "s3" {
        bucket = "killyosaur-terraform-state-bucket"
        key    = "global/do-account-setup/terraform.tfstate"
        region = "us-east-2"
    }
}
