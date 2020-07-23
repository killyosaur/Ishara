data "aws_ami" "amazon_linux" {
  most_recent = true

  owners = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm*"]
  }
}

resource "aws_instance" "arango_instance" {
  count = var.child_instance_count == 0 ? 1 : 0

  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.instance_type
  associate_public_ip_address = true
  key_name                    = var.key_pair
  subnet_id                   = sort(data.aws_subnet_ids.private.ids)[0]
  vpc_security_group_ids      = [aws_security_group.arangodb_security_group.id]

  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file(var.ssh_key_connection)
    timeout     = "5m"
    host        = self.public_ip
  }

  provisioner "remote-exec" {
    inline = [
      "sudo yum update -y",
      "sudo yum install curl -y",
      "sudo sysctl -w \"vm.max_map_count=128000\"",
      "cd /etc/yum.repos.d/",
      "sudo curl -OL https://download.arangodb.com/arangodb36/RPM/arangodb.repo",
      "sudo yum -y install arangodb3",
      "sudo arangod --server.endpoint tcp://0.0.0.0:8529 &",
      "sudo arangodb start"
    ]
  }

  tags = merge({ server = "instance" }, local.tags)
}

resource "aws_instance" "arango_parent" {
  count = var.child_instance_count > 0 ? 1 : 0

  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.instance_type
  associate_public_ip_address = true
  key_name                    = var.key_pair
  subnet_id                   = sort(data.aws_subnet_ids.private.ids)[0]
  vpc_security_group_ids      = [aws_security_group.arangodb_security_group.id]

  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file(var.ssh_key_connection)
    timeout     = "5m"
    host        = self.public_ip
  }

  provisioner "remote-exec" {
    inline = [
      "sudo yum update -y",
      "sudo yum install curl -y",
      "sudo sysctl -w \"vm.max_map_count=128000\"",
      "cd /etc/yum.repos.d/",
      "sudo curl -OL https://download.arangodb.com/arangodb36/RPM/arangodb.repo",
      "sudo yum -y install arangodb3"
    ]
  }

  // set up jwt token
  provisioner "remote-exec" {
    inline = [
      "sudo arangodb create jwt-secret --secret=${local.jwtToken}",
      "sudo arangodb start --auth.jwt-secret=./${local.jwtToken}",
      "sudo arangodb auth header --auth.jwt-secret=./${local.jwtToken}",
      "sudo chmod 777 jwtSecret"
    ]
  }

  provisioner "local-exec" {
    command = "scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i ${var.ssh_key_connection} ec2-user@${aws_instance.arango_parent[0].public_ip}:/home/ec2-user/${local.jwtToken} ./"
  }

  tags = merge({ server = "parent" }, local.tags)
}

resource "aws_instance" "arango_children" {
  count = var.child_instance_count

  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.instance_type
  associate_public_ip_address = true
  key_name                    = var.key_pair
  subnet_id                   = element(sort(data.aws_subnet_ids.private.ids), count.index + 1)
  vpc_security_group_ids      = [aws_security_group.arangodb_security_group.id]

  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file(var.ssh_key_connection)
    timeout     = "5m"
    host        = self.public_ip
  }

  provisioner "remote-exec" {
    inline = [
      "sudo yum update -y",
      "sudo yum install curl -y",
      "sudo sysctl -w \"vm.max_map_count=128000\"",
      "cd /etc/yum.repos.d/",
      "sudo curl -OL https://download.arangodb.com/arangodb36/RPM/arangodb.repo",
      "sudo yum -y install arangodb3"
    ]
  }

  provisioner "file" {
    source      = local.jwtToken
    destination = "/tmp/${local.jwtToken}"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo arangodb start --starter.join ${aws_instance.arango_parent[0].private_ip} --auth.jwt-secret=/tmp/${local.jwtToken}"
    ]
  }

  tags =  merge({ server = "child ${count.index + 1}" }, local.tags)
}
