# Technical Spec_Engine - Enterprise Deployment Guide

## 🏢 **For IT Administrators**

### **Prerequisites**
- Docker and Docker Compose installed on server
- N8N workflow running and accessible
- Port 3000 available (or change in docker-compose.yml)

### **Quick Deployment**

1. **Copy the project folder** to your server
2. **Update the N8N webhook URL** in `docker-compose.yml`:
   ```yaml
   environment:
     - NEXT_PUBLIC_N8N_WEBHOOK_URL=http://your-actual-n8n-server:5678/webhook/your-webhook-id
   ```
3. **Deploy the application**:
   ```bash
   docker-compose up -d
   ```
4. **Access at**: `http://your-server-ip:3000`

### **Production Configuration**

#### **Environment Variables**
Create `.env.production`:
```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://your-n8n-server:5678/webhook/your-webhook-id
NODE_ENV=production
```

#### **Reverse Proxy (Recommended)**
Set up nginx or Apache to serve on port 80/443:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### **SSL Certificate**
- Install Let's Encrypt or company SSL certificate
- Configure HTTPS for secure access

### **User Management**

#### **Default Credentials**
- **Username**: `admin`
- **Password**: `password123`

#### **Security Recommendations**
1. **Change default password** immediately
2. **Implement proper authentication** (LDAP, SSO)
3. **Set up user roles** and permissions
4. **Enable audit logging**

### **Monitoring & Maintenance**

#### **Health Checks**
```bash
# Check if container is running
docker ps

# View logs
docker logs technical-spec-engine

# Restart if needed
docker-compose restart
```

#### **Updates**
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

#### **Backup**
- Backup the entire project folder
- Consider database backup if implementing user management

### **Network Configuration**

#### **Firewall Rules**
- Allow port 3000 (or your chosen port)
- Allow communication with N8N server
- Configure internal network access

#### **Load Balancer (Optional)**
For high availability, set up multiple instances behind a load balancer.

### **Troubleshooting**

#### **Common Issues**
1. **Port conflicts**: Change port in docker-compose.yml
2. **N8N connection**: Verify webhook URL and network connectivity
3. **Memory issues**: Increase Docker memory limits
4. **Permission errors**: Check file ownership and Docker user

#### **Logs**
```bash
# Application logs
docker logs technical-spec-engine

# System logs
journalctl -u docker
```

### **Support Contacts**
- **Application Issues**: Contact development team
- **Infrastructure Issues**: Contact IT support
- **N8N Integration**: Contact workflow administrator

---

## 📋 **Deployment Checklist**

- [ ] Docker and Docker Compose installed
- [ ] N8N webhook URL configured
- [ ] Port 3000 available
- [ ] SSL certificate configured (if using HTTPS)
- [ ] Default password changed
- [ ] User access configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Documentation shared with users
