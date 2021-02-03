provider "aws" {
  region = "us-east-1"
}

resource "aws_ecr_repository" "ishara_admin" {
  name                 = "ishara.admin.api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "ishara_admin" {
  repository = aws_ecr_repository.ishara_admin.name

  policy = <<POLICY
{
    "rules": [
        {
            "rulePriority": 2,
            "description": "Expire untagged images older than 14 days",
            "selection": {
                "tagStatus": "untagged",
                "countType": "sinceImagePushed",
                "countUnit": "days",
                "countNumber": 14
            },
            "action": {
                "type": "expire"
            }
        },
        {
            "rulePriority": 1,
            "description": "Keep last 30 images",
            "selection": {
                "tagStatus": "tagged",
                "tagPrefixList": ["v"],
                "countType": "imageCountMoreThan",
                "countNumber": 30
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
POLICY
}

resource "aws_ecr_repository" "ishara_web" {
  name                 = "ishara.api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "ishara_web" {
  repository = aws_ecr_repository.ishara_web.name

  policy = <<POLICY
{
    "rules": [
        {
            "rulePriority": 2,
            "description": "Expire untagged images older than 14 days",
            "selection": {
                "tagStatus": "untagged",
                "countType": "sinceImagePushed",
                "countUnit": "days",
                "countNumber": 14
            },
            "action": {
                "type": "expire"
            }
        },
        {
            "rulePriority": 1,
            "description": "Keep last 30 images",
            "selection": {
                "tagStatus": "tagged",
                "tagPrefixList": ["v"],
                "countType": "imageCountMoreThan",
                "countNumber": 30
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
POLICY
}

resource "aws_iam_user" "ecr" {
  name = "ecr_user"
  tags = {
    app = "Ishara"
  }

  path = "/system/"
}

resource "aws_iam_access_key" "ecr" {
  user = aws_iam_user.ecr.name
}

resource "aws_iam_user_policy" "ecr_ro" {
  name = "readonly-ecr-policy"
  user = aws_iam_user.ecr.name

  policy = <<POLLY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:GetRepositoryPolicy",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:DescribeImages",
        "ecr:BatchGetImage",
        "ecr:GetLifecyclePolicy",
        "ecr:GetLifecyclePolicyPreview",
        "ecr:ListTagsForResource",
        "ecr:DescribeImageScanFindings"
      ],
      "Resource": "*"
    }
  ]
}
  POLLY
}

data "aws_caller_identity" "current" {}

#resource "kubernetes_secret" "aws_secret" {
#  depends_on = [kubernetes_namespace.anarchy_for_sale, aws_iam_user.ecr]
#
#  metadata {
#    name      = "aws-key"
#    namespace = "anarchy-for-sale"
#  }
#
#  data = {
#    username = aws_iam_access_key.ecr.id
#    password = aws_iam_access_key.ecr.secret
#  }
#
#  type = "kubernetes.io/basic-auth"
#}
#
#resource "kubernetes_service_account" "ecr_pull" {
#  metadata {
#    name      = "ecr-pull-account"
#    namespace = "anarchy-for-sale"
#  }
#}
#
#resource "kubernetes_cluster_role" "ecr_pull" {
#  metadata {
#    name = "ecr-pull-role"
#  }
#
#  rule {
#    api_groups      = [ "" ]
#    resources       = [ "secrets" ]
#    resource_names  = [ "us-east-1-ecr-repository" ]
#    verbs           = [ "get","delete" ]
#  }
#  
#  rule {
#    api_groups = [ "" ]
#    resources  = [ "secrets" ]
#    verbs      = [ "create" ]
#  }
#}
#
#resource "kubernetes_cluster_role_binding" "ecr_pull" {
#  metadata {
#    name = "ecr-pull-rbac"
#  }
#
#  subject {
#    kind      = "ServiceAccount"
#    name      = "ecr-pull-account"
#    namespace = "anarchy-for-sale"
#  }
#
#  role_ref {
#    kind      = "ClusterRole"
#    api_group = "rbac.authorization.k8s.io"
#    name      = "ecr-pull-role"
#  }
#}
#
#resource "kubernetes_cron_job" "ecr_pull" {
#  depends_on = [kubernetes_namespace.anarchy_for_sale]
#
#  metadata {
#    name      = "ecr-pull-job"
#    namespace = "anarchy-for-sale"
#  }
#
#  spec {
#    schedule                      = "0 */6 * * *"
#    concurrency_policy            = "Allow"
#    successful_jobs_history_limit = 3
#    failed_jobs_history_limit     = 1
#    job_template {
#      metadata {
#        annotations = {
#          creationTimestamp = null
#        }
#      }
#      spec {
#        template {
#          metadata {
#            annotations = {
#              creationTimestamp = null
#            }
#          }
#
#          spec {
#            service_account_name = "ecr-pull-account"
#            container {
#              image             = "nabsul/k8s-ecr-login-renew:latest"
#              image_pull_policy = "IfNotPresent"
#              name              = "ecr-pull"
#              #volume_mount {
#              #  name       = "kubectl-config"
#              #  mount_path = "/root/.kube/config"
#              #  read_only  = true
#              #}
#              env {
#                name  = "DOCKER_SECRET_NAME"
#                value = "us-east-1-ecr-registry"
#              }
#              env {
#                name  = "TARGET_NAMESPACE"
#                value = "anarchy-for-sale"
#              }
#              env {
#                name  = "AWS_REGION"
#                value = "us-east-1"
#              }
#              env {
#                name = "AWS_ACCESS_KEY_ID"
#                value_from {
#                  secret_key_ref {
#                    key  = "username"
#                    name = kubernetes_secret.aws_secret.metadata[0].name
#                  }
#                }
#              }
#              env {
#                name = "AWS_SECRET_ACCESS_KEY"
#                value_from {
#                  secret_key_ref {
#                    key  = "password"
#                    name = kubernetes_secret.aws_secret.metadata[0].name
#                  }
#                }
#              }
#            }
#            #container {
#            #  image             = "python:alpine"
#            #  image_pull_policy = "IfNotPresent"
#            #  name              = "ecr-pull"
#            #  command = [
#            #    "/bin/sh",
#            #    "-c",
#            #    <<BASH
#            #    apk add --update unzip && rm -rf /var/cache/apk/*
#            #    apk add --update curl && rm -rf /var/cache/apk/*
#            #    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
#            #    unzip awscliv2.zip
#            #    ./aws/install
#            #    SECRET_NAME=$${AWS_DEFAULT_REGION}-ecr-registry
#            #    EMAIL=anymail.doesnt.matter@email.com
#            #    TOKEN=`aws ecr get-login-password --region $${AWS_DEFAULT_REGION} | cut -d' ' -f6`
#            #    echo "ENV variables setup done."
#            #    kubectl delete secret --ignore-not-found $SECRET_NAME
#            #    kubectl create secret docker-registry $SECRET_NAME -n anarchy-for-sale \
#            #      --docker-server=https://$${ACCOUNT}.dkr.ecr.$${AWS_DEFAULT_REGION}.amazonaws.com \
#            #      --docker-username=AWS \
#            #      --docker-password="$${TOKEN}" \
#            #      --docker-email="$${EMAIL}"
#            #    echo "Secret created by name. $SECRET_NAME"
#            #    kubectl patch serviceaccount default -p '{"imagePullSecrets":[{"name":"'$SECRET_NAME'"}]}'
#            #    echo "All done."
#            #    BASH
#            #  ]
#            #  volume_mount {
#            #    name       = "kubectl-binary"
#            #    mount_path = "/usr/local/bin/kubectl"
#            #    read_only  = true
#            #  }
#            #  volume_mount {
#            #    name       = "kubectl-config"
#            #    mount_path = "/root/.kube/config"
#            #    read_only  = true
#            #  }
#            #  env {
#            #    name  = "ACCOUNT"
#            #    value = trimspace(data.aws_caller_identity.current.account_id)
#            #  }
#            #  env {
#            #    name  = "AWS_DEFAULT_REGION"
#            #    value = "us-east-1"
#            #  }
#            #  env {
#            #    name = "AWS_ACCESS_KEY_ID"
#            #    value_from {
#            #      secret_key_ref {
#            #        key  = "username"
#            #        name = kubernetes_secret.aws_secret.metadata[0].name
#            #      }
#            #    }
#            #  }
#            #  env {
#            #    name = "AWS_SECRET_ACCESS_KEY"
#            #    value_from {
#            #      secret_key_ref {
#            #        key  = "password"
#            #        name = kubernetes_secret.aws_secret.metadata[0].name
#            #      }
#            #    }
#            #  }
#            #}
#            dns_policy                       = "Default"
#            host_network                     = true
#            restart_policy                   = "Never"
#            termination_grace_period_seconds = 30
#
#            #volume {
#            #  name = "kubectl-binary"
#            #  host_path {
#            #    path = "/usr/local/bin/kubectl"
#            #  }
#            #}
#
#            #volume {
#            #  name = "kubectl-config"
#            #  host_path {
#            #    path = "/root/.kube/config"
#            #  }
#            #}
#          }
#        }
#      }
#    }
#  }
#}
#