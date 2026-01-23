# Alto IAM Cloud Deployment Guide

## Quick Start (Local Development)

```bash
# Start Keycloak, PostgreSQL, MailHog
docker compose up -d

# Access
# - Keycloak Admin: http://localhost:8080/admin (admin/admin)
# - MailHog: http://localhost:8025
```

## Production Deployment with Cloudflare Tunnel

### Prerequisites
- Domain managed by Cloudflare
- cloudflared installed on VM

### 1. Install cloudflared on VM

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
cloudflared tunnel login
```

### 2. Create Tunnel

```bash
# Create tunnel
cloudflared tunnel create alto-iam

# Note the tunnel ID from output
# Create routes (replace YOUR_DOMAIN)
cloudflared tunnel route dns alto-iam auth.YOUR_DOMAIN.com
cloudflared tunnel route dns alto-iam iam.YOUR_DOMAIN.com
```

### 3. Configure Tunnel

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: alto-iam
credentials-file: /home/alto/.cloudflared/<TUNNEL_ID>.json

ingress:
  # Keycloak
  - hostname: auth.YOUR_DOMAIN.com
    service: http://localhost:8080
  # Alto CERO IAM
  - hostname: iam.YOUR_DOMAIN.com
    service: http://localhost:3000
  # API
  - hostname: api.YOUR_DOMAIN.com
    service: http://localhost:3001
  # Catch-all
  - service: http_status:404
```

### 4. Create .env File

```bash
cat > .env << 'EOF'
# Domain Configuration
PUBLIC_URL=https://auth.YOUR_DOMAIN.com
IAM_URL=https://iam.YOUR_DOMAIN.com
API_URL=https://api.YOUR_DOMAIN.com

# Keycloak
KC_ADMIN_USER=admin
KC_ADMIN_PASSWORD=<strong-password>

# Database
POSTGRES_USER=keycloak
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=keycloak

# Alto CERO IAM (build-time)
VITE_KEYCLOAK_URL=https://auth.YOUR_DOMAIN.com
VITE_KEYCLOAK_REALM=master
VITE_KEYCLOAK_CLIENT_ID=alto-cero-iam
VITE_API_URL=https://api.YOUR_DOMAIN.com/api

# API
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=master

# SMTP (Gmail)
KC_SMTP_HOST=smtp.gmail.com
KC_SMTP_PORT=587
KC_SMTP_USER=your-email@gmail.com
KC_SMTP_PASSWORD=your-app-password
KC_SMTP_FROM=your-email@gmail.com
KC_SMTP_STARTTLS=true
KC_SMTP_AUTH=true
EOF
```

### 5. Deploy Full Stack

```bash
# Build and start everything
docker compose --profile full up -d --build

# Start Cloudflare tunnel
cloudflared tunnel run alto-iam

# Or install as systemd service
sudo cloudflared service install
sudo systemctl start cloudflared
```

### 6. Configure Keycloak Client (via Terraform)

```bash
cd terraform

# Create terraform.tfvars
cat > terraform.tfvars << 'EOF'
keycloak_url          = "http://localhost:8080"
keycloak_admin_password = "<your-admin-password>"
iam_dashboard_url     = "https://iam.YOUR_DOMAIN.com"
smtp_user             = "your-email@gmail.com"
smtp_password         = "your-app-password"
smtp_from             = "your-email@gmail.com"
EOF

# Apply configuration
terraform init
terraform apply
```

## Test URLs

After deployment:
- **Keycloak Admin**: https://auth.YOUR_DOMAIN.com/admin
- **Alto CERO IAM**: https://iam.YOUR_DOMAIN.com
- **Request Access**: https://iam.YOUR_DOMAIN.com/request-access
- **API Health**: https://api.YOUR_DOMAIN.com/api/health

## Default Credentials

| Service | Username | Password |
|---------|----------|----------|
| Keycloak Admin | admin | admin |
| Alto Admin (alto realm) | admin@alto.cloud | admin |

**IMPORTANT**: Change all default passwords before production use!

## Architecture

```
Cloudflare Tunnel
    │
    ├── auth.domain.com ──→ Keycloak (8080)
    ├── iam.domain.com ──→ Alto CERO IAM (3000)
    └── api.domain.com ──→ API Server (3001)
```

## Troubleshooting

### Keycloak won't start
```bash
docker compose logs keycloak
```

### Database connection issues
```bash
docker compose exec postgres pg_isready
```

### Check tunnel status
```bash
cloudflared tunnel info alto-iam
```
