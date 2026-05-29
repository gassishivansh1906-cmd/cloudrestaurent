# ☁️ AWS EC2 Deployment Guide — CloudRestaurant

This guide walks you through deploying the full stack (frontend + backend + SQL Server)
to a single **AWS EC2** instance using Docker, and wiring up **automated CI/CD** from
GitHub.

---

## 1. Prerequisites
- An AWS account.
- A GitHub repo containing this project (see "Connect to GitHub" below).
- An SSH key pair (`.pem`) for the EC2 instance.

---

## 2. Launch an EC2 instance

1. Go to **EC2 → Instances → Launch instances**.
2. **Name:** `cloudrestaurant`.
3. **AMI:** Ubuntu Server 24.04 LTS (x86_64).
4. **Instance type:** `t3.medium` minimum.
   > SQL Server needs at least **2 GB RAM**. `t3.medium` (4 GB) is recommended; a `t2.micro`
   > free-tier box is **not** enough to run SQL Server reliably.
5. **Key pair:** create or choose one and download the `.pem` file.
6. **Storage:** 30 GB gp3.
7. Launch.

### Security group (firewall) rules — inbound
| Type        | Port | Source            | Why                         |
|-------------|------|-------------------|-----------------------------|
| SSH         | 22   | My IP             | Admin access                |
| HTTP        | 80   | Anywhere (0.0.0.0/0) | Public website          |
| Custom TCP  | 5000 | Anywhere (optional) | Direct API access (debug) |
| Custom TCP  | 1433 | My IP (optional)  | Connect SSMS to the DB      |

---

## 3. Bootstrap the server (one time)

```bash
# from your machine
ssh -i cloudrestaurant.pem ubuntu@<EC2_PUBLIC_IP>

# on the server — install Docker + compose
sudo apt-get update -y
git clone https://github.com/<you>/cloudrestaurent.git
cd cloudrestaurent
bash deploy/ec2-setup.sh

# apply docker group membership without re-login
newgrp docker
```

---

## 4. Configure environment & first deploy

```bash
cd ~/cloudrestaurent
cp .env.example .env
nano .env        # set DB_PASSWORD, JWT_SECRET, CLIENT_ORIGIN=http://<EC2_IP>, admin creds

docker compose up -d --build
docker compose ps          # all services should be "running"/"healthy"
```

Open `http://<EC2_PUBLIC_IP>` in your browser. 🎉

Useful commands:
```bash
docker compose logs -f backend     # tail API logs
docker compose logs -f db-init     # confirm schema/seed ran
docker compose restart backend
docker compose down                # stop (keeps DB volume)
docker compose down -v             # stop + delete DB data
```

---

## 5. Connect to GitHub (so CI/CD can deploy)

On your local machine, in the project root:

```bash
git init
git add .
git commit -m "Initial commit: CloudRestaurant full-stack SaaS"
git branch -M main
git remote add origin https://github.com/<you>/cloudrestaurent.git
git push -u origin main
```

---

## 6. Enable the CI/CD pipeline

1. In your GitHub repo go to **Settings → Secrets and variables → Actions → New repository secret**.
2. Add all secrets listed in the table in the root `README.md` (`EC2_HOST`, `EC2_USER`,
   `EC2_SSH_KEY`, `APP_DIR`, `REPO_URL`, `DB_PASSWORD`, `JWT_SECRET`, `CLIENT_ORIGIN`,
   `ADMIN_*`).
   - `EC2_SSH_KEY` = the **entire contents** of your `.pem` file (including the
     `-----BEGIN ... KEY-----` lines).
   - `APP_DIR` = `/home/ubuntu/cloudrestaurent`.
3. Push any change to `main`. GitHub Actions will:
   - build & test the apps,
   - SSH into EC2, pull the latest code, regenerate `.env`, and
   - `docker compose up -d --build`.

Watch progress under the repo's **Actions** tab.

---

## 7. (Optional) Production hardening
- Put **Nginx / an Application Load Balancer + HTTPS (ACM certificate)** in front, or add
  Caddy/Traefik for automatic Let's Encrypt TLS.
- Point a domain (Route 53) at the EC2 Elastic IP and set `CLIENT_ORIGIN=https://yourdomain`.
- Move the database to **Amazon RDS for SQL Server** for managed backups/HA, then set the
  backend `DB_SERVER` to the RDS endpoint and remove the `db` service from compose.
- Push images to **Amazon ECR** and pull them on deploy instead of building on the host.
- Allocate an **Elastic IP** so the public address doesn't change on reboot.

---

## 8. Troubleshooting
| Symptom | Fix |
|---------|-----|
| `db` container restarts / OOM | Use ≥ 2 GB RAM instance (`t3.medium`). |
| Backend logs "Connection attempt failed" | Normal during DB warm-up; it retries. Check `DB_PASSWORD` matches. |
| Site loads but API calls fail | Confirm `frontend` and `backend` are on the same compose network; check `nginx.conf` proxy. |
| Can't connect SSMS | Open port 1433 to your IP in the security group. |
| CI deploy fails on SSH | Verify `EC2_SSH_KEY` is the full `.pem` content and `EC2_USER=ubuntu`. |
