#!/usr/bin/env bash
# =====================================================================
# CloudRestaurant - one-time EC2 bootstrap
# Run this ONCE on a fresh Ubuntu 22.04/24.04 EC2 instance.
#   ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
#   curl -fsSL <raw-url>/deploy/ec2-setup.sh | bash
# or copy this file over and: bash ec2-setup.sh
# =====================================================================
set -e

echo ">>> Updating packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

echo ">>> Installing Docker Engine + Compose plugin..."
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo ">>> Enabling Docker and adding current user to docker group..."
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker "$USER"

echo ""
echo "============================================================"
echo " EC2 is ready. Log out and back in for docker group to apply."
echo " Then clone your repo and run:  docker compose up -d --build"
echo "============================================================"
