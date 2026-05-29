# ☁️ AWS Free-Tier Deployment (EC2 t3.micro + RDS SQL Server Express)

This is the **cheapest** way to host CloudRestaurant — ~$0/month for the first 12
months within AWS Free Tier limits. The web app (frontend + backend containers) runs
on a tiny EC2 instance, and the database runs on managed **Amazon RDS for SQL Server
Express**.

```
Internet ──▶ EC2 t3.micro (Docker)            Amazon RDS
             ┌─────────────┐   /api   ┌──────┐   ┌───────────────────┐
             │  frontend   │ ───────▶ │ back │ ─▶│ SQL Server Express │
             │ (Nginx :80) │          │ :5000│   │  (CloudRestaurant) │
             └─────────────┘          └──────┘   └───────────────────┘
```

> All steps below are done in the **AWS Console** (no CLI needed). Take your time;
> each step is a separate AWS service.

---

## Part 1 — Create the database (Amazon RDS)

1. AWS Console → search **RDS** → **Create database**.
2. Choose **Standard create**.
3. Engine type: **Microsoft SQL Server** → Edition: **SQL Server Express Edition**.
4. Templates: **Free tier**.
5. Settings:
   - DB instance identifier: `cr-db`
   - Master username: `admin`
   - Master password: choose a strong one (save it!) — e.g. `YourStrongRdsPassw0rd!`
6. Instance configuration: `db.t3.micro` (auto-selected by Free tier).
7. Storage: 20 GB gp3 (Free tier). **Disable** storage autoscaling to avoid charges.
8. Connectivity:
   - **Public access: Yes** (so you can run the init scripts and connect SSMS).
   - VPC security group: **Create new** → name `cr-rds-sg`.
9. Click **Create database**. Wait ~5–10 min until status is **Available**.
10. Open the instance → copy the **Endpoint** (looks like
    `cr-db.xxxxxxxx.<region>.rds.amazonaws.com`). You'll need it.

### Allow access to RDS
- RDS → your DB → **Connectivity & security** → click the security group `cr-rds-sg`.
- **Inbound rules → Edit → Add rule**: Type **MSSQL** (port 1433), Source = your EC2's
  security group (added in Part 2) **and** your own IP (so SSMS 22 can connect).

---

## Part 2 — Launch the web server (EC2)

1. Console → **EC2** → **Launch instance**.
2. Name: `cloudrestaurant-web`.
3. AMI: **Ubuntu Server 24.04 LTS**.
4. Instance type: **t3.micro** (Free tier eligible).
5. Key pair: create one (e.g. `cloudrestaurant.pem`) and download it.
6. Network settings → **Edit** → Security group: create `cr-web-sg` with inbound:
   | Type | Port | Source |
   |------|------|--------|
   | SSH  | 22   | My IP |
   | HTTP | 80   | Anywhere (0.0.0.0/0) |
7. Storage: 8–30 GB (Free tier allows up to 30 GB).
8. **Launch instance**. Allocate an **Elastic IP** (EC2 → Elastic IPs → Allocate →
   Associate to the instance) so the public IP is stable.

---

## Part 3 — Install Docker & deploy

SSH in (from the folder with your `.pem`):

```bash
ssh -i cloudrestaurant.pem ubuntu@<EC2_PUBLIC_IP>

# install Docker + compose, then clone the repo
sudo apt-get update -y
git clone https://github.com/gassishivansh1906-cmd/cloudrestaurent.git
cd cloudrestaurent
bash deploy/ec2-setup.sh
newgrp docker
```

Create the production env file:

```bash
cp .env.prod.example .env
nano .env
```
Set:
```
DB_SERVER=cr-db.xxxxxxxx.<region>.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=YourStrongRdsPassw0rd!
JWT_SECRET=<long-random-string>
CLIENT_ORIGIN=http://<EC2_PUBLIC_IP>
```

Initialize the RDS database (creates tables + sample data):

```bash
RDS_ENDPOINT=cr-db.xxxxxxxx.<region>.rds.amazonaws.com \
RDS_USER=admin RDS_PASSWORD='YourStrongRdsPassw0rd!' \
bash deploy/init-rds.sh
```

Start the app:

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Open **http://<EC2_PUBLIC_IP>** — your SaaS is live. 🎉
Admin login: `admin@cloud.com` / `Admin@123`.

---

## Part 4 — Connect SSMS 22 to RDS (optional)
In SSMS 22:
- Server name: `cr-db.xxxxxxxx.<region>.rds.amazonaws.com,1433`
- Authentication: **SQL Server Authentication**
- Login: `admin` / your RDS password

(Your IP must be allowed in the `cr-rds-sg` inbound rule.)

---

## Part 5 — Automatic deploys (CI/CD)
Add these GitHub repo secrets (**Settings → Secrets and variables → Actions**) so every
push to `main` auto-deploys:

| Secret | Value |
|--------|-------|
| `EC2_HOST` | EC2 Elastic IP |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | full contents of `cloudrestaurant.pem` |
| `APP_DIR` | `/home/ubuntu/cloudrestaurent` |
| `REPO_URL` | `https://github.com/gassishivansh1906-cmd/cloudrestaurent.git` |
| `DB_SERVER` | RDS endpoint |
| `DB_USER` | `admin` |
| `DB_PASSWORD` | RDS password |
| `JWT_SECRET` | long random string |
| `CLIENT_ORIGIN` | `http://<EC2_IP>` |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | admin account |

---

## 💰 Staying within Free Tier
- Use **one** `t3.micro` EC2 and **one** `db.t3.micro` RDS only.
- Stop/terminate when not needed (RDS keeps charging storage if left running beyond
  750 hrs/month across instances).
- Set a **Billing alarm** (Billing → Budgets) for, say, $1 to catch surprises.
- Free tier lasts 12 months from account creation; after that, ~$15–30/mo.

## Troubleshooting
| Issue | Fix |
|-------|-----|
| Backend can't reach RDS | RDS security group must allow port 1433 from the EC2 security group. |
| `init-rds.sh` times out | Confirm RDS **Public access = Yes** and your IP/EC2 SG is in inbound rules. |
| Site 502 | `docker compose -f docker-compose.prod.yml logs backend` — check DB env values. |
| t3.micro feels slow | Add a 2 GB swap file: `sudo fallocate -l 2G /swap && sudo chmod 600 /swap && sudo mkswap /swap && sudo swapon /swap`. |
