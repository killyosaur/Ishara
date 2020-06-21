resource "aws_instance" "arango_parent" {
    ami                         = data.aws_ami.amazon_linux.id
    instance                    = var.instance_type
    associate_public_ip_address = false
    key_name                    = var.key_pair
    subnet_id                   = element(data.aws_subnet_ids.private.ids, count.index)
    vpc_security_group_ids      = [aws_security_group.arangodb_security_group.id]
    
    connection {
        type        = "ssh"
        user        = "ec2-user"
        private_key = file(var.ssh_key_connection)
        timeout     = "5m"
    }

    provisioner "file" {
        source      = "arangodb.sh"
        destination = "/tmp/arangodb.sh"
    }

    provisioner "remote-exec" {
        inline = [
            "chmod +x /tmp/arangodb.sh",
            "sudo /tmp/arangodb.sh"
        ]
    }

    // set up jwt token
    provisioner "remote-exec" {
        inline = [
            "sudo arangodb create jwt-secret --secret=jwtSecret",
            "sudo arangodb start --auth.jwt-secret=./jwtSecret",
            "sudo arangodb auth header --auth.jwt-secret=./jwtSecret",
            "sudo chmod 777 jwtSecret"
        ]
    }

    provisioner "local-exec" {
        command = "scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i ${var.ssh_key_connection} ec2-user@${aws_instance.arango_parent.private_ip}:/home/ec2-user/jwtSecret ./"
    }

    tags = local.tags
}

resource "aws_instance" "arango_children" {
    count = var.child_instance_count

    ami                         = data.aws_ami.amazon_linux.id
    instance_type               = var.instance_type
    associate_public_ip_address = false
    key_name                    = var.key_pair
    subnet_id                   = element(data.aws_subnet_ids.private.ids, count.index)    
    vpc_security_group_ids      = [aws_security_group.arangodb_security_group.id]
    
    connection {
        type        = "ssh"
        user        = "ec2-user"
        private_key = file(var.ssh_key_connection)
        timeout     = "5m"
    }

    provisioner "file" {
        source      = "arangodb.sh"
        destination = "/tmp/arangodb.sh"
    }

    provisioner "remote-exec" {
        inline = [
            "chmod +x /tmp/arangodb.sh",
            "sudo /tmp/arangodb.sh"
        ]
    }

    provisioner "file" {
        source      = "jwtSecret"
        destination = "/tmp/jwtSecret"
    }

    provisioner "remote-exec" {
        inline = [
            "sudo arangodb start --starter.join ${aws_instance.arango_parent.private_ip} --auth.jwt-secret=/tmp/jwtSecret"
        ]
    }

    tags = local.tags
}
