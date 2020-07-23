#! /bin/bash

sudo yum update -y
sudo yum install curl -y
sudo sysctl -w "vm.max_map_count=128000"
cd /etc/yum.repos.d/
sudo curl -OL https://download.arangodb.com/arangodb36/RPM/arangodb.repo
sudo yum -y install arangodb3
