# 🚀 CropX 2.0 — Render Production Deployment Guide

## 1. Overview & Architecture

**Production URL**: [https://croperx-2.onrender.com/](https://croperx-2.onrender.com/)  
**Platform**: Render Web Service (Node.js LTS / Docker runtime)  
**Architecture**: Server-Authoritative Express Application with Vite React SPA Frontend  
**Port Binding**: Dynamic port assigned via `process.env.PORT` (defaults to 3000 locally), binding to `0.0.0.0`.

---

## 2. Quick Deploy Instructions

### A. Repository Settings in Render Dashboard
1. Go to **Render Dashboard** → **New Web Service**.
2. Connect your Git repository (`CropX 2.0`).
3. Set the following build and start commands:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start` (which executes `node dist/server.cjs`)
   - **Health Check Path**: `/api/health`

### B. Alternative: Deploy via `render.yaml` Blueprint
The repository contains a fully configured `render.yaml` file at the root. You can link this repository as a **Render Blueprint** for automatic environment and service provisioning.

---

## 3. Environment Variables Specification

> **SECURITY DIRECTIVE**: Set all sensitive keys in the Render Dashboard under **Environment**. Never commit real API keys, database passwords, or private tokens to Git or `.env` files.

### Mandatory Production Variables
| Variable Name | Required | Description | Example / Notes |
| :--- | :--- | :--- | :--- |
| `PORT` | **Automatic** | Render automatically injects this port variable. | Automatically allocated by Render |
| `NODE_ENV` | **Yes** | Sets the Node runtime environment. | `production` |
| `GEMINI_API_KEY` | **Yes** | Server-side Google Gemini 2.5 Flash API Key for agronomic reasoning & vision analysis. | Google AI Studio Key |
| `SESSION_SECRET` | **Yes** | Cryptographic key for signing HMAC session tokens and tamper-evident cookies. | Minimum 32 random characters |
| `DATA_DIR` | **Recommended** | Directory for persistent local storage (e.g. Render Persistent Disk mount path). | `/var/data` or `./data` |

### Supabase Cloud Persistence (Production Authoritative DB)
| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `SUPABASE_URL` | **Yes** | URL of your Supabase cloud project instance. |
| `SUPABASE_ANON_KEY` | **Yes** | Supabase anonymous public client key. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Server-only service role secret key for administrative migrations and backend operations. |

### Optional Remote Sensing & Telemetry Providers
| Variable Name | Provider | Description if Configured | Behavior if Missing (Fallback) |
| :--- | :--- | :--- | :--- |
| `SENTINEL_HUB_CLIENT_ID` | Sentinel-2 | ESA Copernicus multispectral satellite pass. | Gracefully falls back to Regional Agronomic Crop Growth Model (`FALLBACK_MODEL`). |
| `SENTINEL_HUB_CLIENT_SECRET` | Sentinel-2 | Satellite authentication secret. | Same as above. |
| `ISRO_BHUVAN_API_KEY` | ISRO Bhuvan | High-resolution satellite imagery for Indian subcontinent. | Uses Agro-Climatic baseline. |
| `IOT_BROKER_URL` | IoT Sensors | MQTT / REST LoRaWAN gateway for physical FDR moisture probes. | Falls back to ICAR Regional Soil Classification Survey. |
| `SOIL_TELEMETRY_API_KEY` | IoT Gateway | Authentication key for field sensor network. | Same as above. |
| `AGMARKNET_API_KEY` | e-NAM / Agmarknet | Real-time APMC Mandi commodity trading feed. | Uses historical verified APMC seasonal trading bands. |
| `ENABLE_DEV_OTP` | Auth / Delivery | Set to `false` in production. If `false`, requires real OTPs. | Must be unset or `false` in production. |

---

## 4. Cold-Start, Disk Persistence & State Handling

### Cold-Start Resilience
Render free and standard web services scale to zero during inactivity. CropX 2.0 is hardened for cold-starts:
1. **Lazy SDK Initialization**: The Google GenAI SDK and external clients initialize safely only on the first incoming request rather than halting boot if a network handshake fluctuates.
2. **Synchronous File Booting**: Initial schemas and directory structures verify and mount in under 80ms before `app.listen()` activates.
3. **Graceful Shutdown**: The server listens for `SIGTERM` and `SIGINT`, cleanly terminating open HTTP connections within a 10-second timeout.

### Persistent Disks on Render
If you attach a Render Persistent Disk (e.g. `/var/data`):
- Set `DATA_DIR=/var/data`.
- All JSON caches, audit logs, exam records, and offline storage fallbacks will persist indefinitely across redeployments and container restarts.
- Even without a persistent disk, dual-layer cloud synchronization automatically persists authoritative data to Supabase PostgreSQL when credentials are provided.

---

## 5. Health Check & Monitoring Endpoints

| Endpoint | Method | Purpose | Sample Status Code |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Instant liveness check for Render load balancer. | `200 OK` (`status: "ok"`) |
| `/api/health/readiness` | `GET` | Deep readiness check validating memory, storage paths, and AI service initialization. | `200 OK` (`status: "ready"`) |
| `/api/health/database` | `GET` | Validates Supabase PostgreSQL connectivity and migration state. | `200 OK` / `503 Service Unavailable` |
| `/api/ai/audit/tenant-isolation` | `GET` | Verifies zero cross-tenant memory leakage across all farmer profiles. | `200 OK` (`leakageDetected: false`) |

---

## 6. Verification Checklist Before Going Live

1. **Verify SPA Routing**: Navigating directly to `/adviser`, `/dashboard`, or `/store` loads `index.html` cleanly without 404s.
2. **Verify API Protection**: Requests to `/api/*` that do not match a route return `404 JSON`, never the SPA HTML page.
3. **Verify Header Security**: `X-Frame-Options`, `X-Content-Type-Options`, and `Strict-Transport-Security` headers are present.
4. **Verify Telemetry Labels**: Telemetry data displays verified provider badges (`LIVE` for Open-Meteo, `FALLBACK_MODEL` for unconfigured satellite/IoT).
5. **Verify Clean Logs**: No credentials or private tokens are logged to Render standard out or console.
