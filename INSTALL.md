# FitTrack - Installation Guide

## Prerequisites

Install Docker and Docker Compose on your Debian server:

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in for group change to take effect
```

## Deploy

```bash
# Clone the repository
git clone <your-repo-url> fittrack
cd fittrack

# Build and start
docker compose up -d --build
```

The app is now available at `http://<server-ip>:8080`.

## Update

```bash
git pull
docker compose up -d --build
```

## Stop / Remove

```bash
# Stop
docker compose down

# Stop and remove the image
docker compose down --rmi local
```
