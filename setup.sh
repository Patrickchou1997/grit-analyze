#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Installing..."
    
    # Install Docker (for Ubuntu-based systems)
    # Update the apt package index
    sudo apt-get update

    # Install packages to allow apt to use a repository over HTTPS
    sudo apt-get install \
        apt-transport-https \
        ca-certificates \
        curl \
        software-properties-common

    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # Set up the stable repository
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Update apt index again and install Docker
    sudo apt-get update
    sudo apt-get install docker-ce

    # Start Docker service and enable it
    sudo systemctl start docker
    sudo systemctl enable docker
    
    echo "Docker has been installed successfully."
else
    echo "Docker is already installed."
fi

# Run Docker Compose
echo "Stopping and removing existing containers..."
docker-compose down -v

echo "Building and starting new containers..."
docker-compose up --build -d

echo "Setup completed successfully!"
