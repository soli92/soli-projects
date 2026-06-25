---
type: runbook
created: 2026-06-25
topic: deploy-oracle-arm
---
# Runbook: Deploy Oracle ARM — soli-platform

> Provisioning e deploy di soli-platform (soli-auth, soli-notification, soli-gateway) su Oracle Cloud Infrastructure Free Tier con VM ARM Ampere A1.

## Pre-requisiti

- Account OCI (Oracle Cloud Infrastructure) con **Always Free** attivo.
- OCI CLI installato e configurato (`oci setup config`):
  ```bash
  # Verifica configurazione
  oci iam user get --user-id <your-user-ocid>
  ```
- SSH key generata (`~/.ssh/id_rsa` o dedicata per OCI) e caricata in OCI → Identity → Users → [utente] → API Keys.
- Compartment OCID disponibile (da OCI → Identity → Compartments).
- Script `provision-oci-arm-retry.sh` presente nel repo soli-platform (`deploy/` o root).

## Provisioning con `provision-oci-arm-retry.sh`

Il free tier OCI ha una finestra limitata di VM ARM disponibili. Il provisioning fallisce spesso con `Out of capacity`. Lo script gestisce il retry automatico.

### Utilizzo

```bash
chmod +x provision-oci-arm-retry.sh
./provision-oci-arm-retry.sh
```

### Cosa fa lo script

1. Tenta il provisioning di una VM ARM Ampere A1 (`VM.Standard.A1.Flex`) con le specifiche free tier (4 OCPU, 24 GB RAM — massimo combinabile gratuitamente).
2. Se riceve errore `InternalError` o `Out of capacity`, attende un intervallo randomizzato (default: 10–30 minuti) e riprova.
3. Al successo, stampa l'OCID dell'istanza e l'IP pubblico assegnato.

### Parametri tipici

```bash
# Variabili da impostare prima di eseguire lo script
export OCI_COMPARTMENT_ID="ocid1.compartment.oc1..xxxxx"
export OCI_SUBNET_ID="ocid1.subnet.oc1..xxxxx"
export OCI_IMAGE_ID="ocid1.image.oc1..xxxxx"       # Ubuntu 22.04 ARM
export OCI_SSH_PUBLIC_KEY="$(cat ~/.ssh/id_rsa.pub)"
export INSTANCE_SHAPE="VM.Standard.A1.Flex"
export INSTANCE_OCPUS=4
export INSTANCE_MEMORY_GB=24
```

## Setup rete (VCN, subnet, security group)

### VCN e subnet

Creare via OCI Console o CLI:

```bash
# Crea VCN
oci network vcn create \
  --compartment-id $OCI_COMPARTMENT_ID \
  --cidr-block "10.0.0.0/16" \
  --display-name "soli-platform-vcn"

# Crea subnet pubblica
oci network subnet create \
  --compartment-id $OCI_COMPARTMENT_ID \
  --vcn-id <vcn-ocid> \
  --cidr-block "10.0.1.0/24" \
  --display-name "soli-platform-subnet"
```

### Security List — porte da aprire

| Porta | Protocollo | Servizio |
|-------|-----------|---------|
| 22 | TCP | SSH (accesso admin) |
| 80 | TCP | HTTP (gateway / redirect) |
| 443 | TCP | HTTPS (gateway) |
| 8080 | TCP | soli-auth |
| 8081 | TCP | soli-notification |
| 10000 | TCP | soli-gateway (porta interna, se esposta) |

```bash
# Aggiungere ingress rule per porta 8080 (esempio)
oci network security-list update \
  --security-list-id <sl-ocid> \
  --ingress-security-rules '[{
    "source": "0.0.0.0/0",
    "protocol": "6",
    "tcpOptions": {"destinationPortRange": {"min": 8080, "max": 8080}}
  }]'
```

> Nota: aggiornare le security list è un'operazione additiva. Usare `--force` con cautela per evitare di sovrascrivere regole esistenti.

### Firewall OS (sulla VM)

```bash
# Ubuntu 22.04 — ufw
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8081/tcp
sudo ufw enable
```

## Docker Compose su VM

### Struttura `docker-compose.yml` soli-platform

```yaml
# deploy/docker-compose.prod.yml (estratto struttura)
services:
  soli-auth:
    image: ghcr.io/soli92/soli-platform-auth:main
    ports:
      - "8080:8080"
    env_file: stack.env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  soli-notification:
    image: ghcr.io/soli92/soli-platform-notification:main
    ports:
      - "8081:8081"
    env_file: stack.env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8081/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  soli-gateway:
    image: ghcr.io/soli92/soli-platform-gateway:main
    ports:
      - "80:80"
      - "443:443"
    env_file: stack.env
    restart: unless-stopped
    depends_on:
      - soli-auth
      - soli-notification
```

### Installare Docker sulla VM

```bash
# Ubuntu 22.04
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Verifica
docker --version
docker compose version
```

### Autenticazione GHCR

```bash
# Login su GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u soli92 --password-stdin
```

## `stack.env` — variabili d'ambiente

Il file `stack.env` (non committato, da creare manualmente sulla VM) contiene tutte le variabili runtime:

```bash
# Template stack.env (da stack.env.example nel repo)
NODE_ENV=production

# Auth service
JWT_SECRET=<secret>
JWT_EXPIRES_IN=7d
SUPABASE_URL=<url>
SUPABASE_SERVICE_ROLE_KEY=<key>

# Notification service
RESEND_API_KEY=<key>
FROM_EMAIL=noreply@soli92.dev

# Redis (se bundled)
REDIS_URL=redis://redis:6379

# Gateway
AUTH_SERVICE_URL=http://soli-auth:8080
NOTIFICATION_SERVICE_URL=http://soli-notification:8081
```

> Mai committare `stack.env` nel repo. Copiare `stack.env.example` dalla root e valorizzarlo sulla VM.

## Deploy update

Procedura per aggiornare i container con le ultime immagini pubblicate su GHCR:

```bash
# SSH nella VM
ssh ubuntu@<vm-ip>

# Pull ultime immagini
cd /opt/soli-platform
docker compose -f deploy/docker-compose.prod.yml pull

# Restart con zero-downtime (ordine: riavvia un container alla volta)
docker compose -f deploy/docker-compose.prod.yml up -d

# Verifica
docker compose -f deploy/docker-compose.prod.yml ps
curl http://localhost:8080/health
curl http://localhost:8081/health
```

### Deploy automatico via GitHub Actions

soli-platform supporta deploy automatico SSH via workflow `publish-containers.yml`:
- Dopo CI verde su `main`, pubblica immagini su GHCR.
- Poi esegue `deploy-ssh.yml` che si connette alla VM via SSH e aggiorna i container.
- Prerequisiti: secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_PRIVATE_KEY` configurati nel repo.

## Troubleshooting free tier limits

### Errore "Out of capacity"

Il free tier ARM è soggetto a constraint di capacità per regione. L'errore si manifesta come:

```
ServiceError: {
  "code": "InternalError",
  "message": "Out of host capacity."
}
```

**Soluzioni:**

1. **Retry automatico:** lo script `provision-oci-arm-retry.sh` gestisce questo caso con backoff.
2. **Timing consigliato:** i tentativi riusciti si concentrano nelle ore di bassa domanda (notte europea: 02:00–06:00 UTC+1). Lanciare lo script in background con `nohup` o `tmux`.
3. **Region alternativa:** se la region principale è satura, provare `eu-frankfurt-1` o `uk-london-1` (entrambe free tier eligible).
4. **Approccio alternativo:** creare VM shape più piccola (1 OCPU, 6 GB) per sbloccare il provisioning, poi fare resize a 4 OCPU / 24 GB dopo.

### VM non raggiungibile dopo provisioning

```bash
# Verifica security list OCI (porta 22 aperta)
oci network security-list get --security-list-id <sl-ocid>

# Verifica ufw sulla VM (se si riesce ad accedere)
sudo ufw status verbose

# Verifica IP pubblico assegnato
oci compute instance list-vnics --instance-id <instance-ocid>
```

### Immagine Docker non si avvia

```bash
# Verifica logs container
docker compose -f deploy/docker-compose.prod.yml logs soli-auth

# Verifica variabili env caricate
docker compose -f deploy/docker-compose.prod.yml config
```

### GHCR pull fallisce

```bash
# Rinnova token GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u soli92 --password-stdin

# Verifica immagine disponibile
docker manifest inspect ghcr.io/soli92/soli-platform-auth:main
```

## Riferimenti

- [[deployment-patterns]] — architettura deploy ecosistema soli92
- [[soli-platform]] — source page soli-platform (Docker monorepo, auth, notification, gateway)
- [[uptime-monitoring]] — monitoring health check Oracle ARM services
