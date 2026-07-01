#!/bin/bash
# Kadastro Portal - Tüm servisleri başlat (Orijinal Port Planı)
#
# Frontend Portları (kaynak koddan tespit edilmiştir):
#   Portal       → 4200  (ana giriş noktası)
#   Duyuru       → 4202
#   Yardim       → 4204
#   Istatistik   → 4205
#   Login        → 4212  (giriş yapıldıktan sonra portal'a yönlendirir)
#
# Backend Portları (.csproj varsayılan):
#   Portal.API      → 5080
#   Duyuru.API      → 5005
#   Istatistik.API  → varsayılan
#   Yardim.API      → varsayılan
#   Login.API       → varsayılan
#   API-Gateway     → varsayılan

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT_DIR/.logs"
mkdir -p "$LOG_DIR"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Kadastro Portal Başlatılıyor ===${NC}"
echo -e "Log dizini: $LOG_DIR"
echo ""

# ─── BACKEND SERVİSLERİ ───────────────────────────────────────
echo -e "${CYAN}[Backend] API-Gateway başlatılıyor...${NC}"
dotnet run --project "$ROOT_DIR/API-Gateway/backend/Gateway/Gateway.csproj" \
  > "$LOG_DIR/api-gateway.log" 2>&1 &
echo "  PID: $! | Log: .logs/api-gateway.log"

sleep 1

echo -e "${CYAN}[Backend] Login.API başlatılıyor...${NC}"
dotnet run --project "$ROOT_DIR/Login/backend/Login.API/Login.API.csproj" \
  > "$LOG_DIR/login-api.log" 2>&1 &
echo "  PID: $! | Log: .logs/login-api.log"

sleep 1

echo -e "${CYAN}[Backend] Portal.API başlatılıyor...${NC}"
dotnet run --project "$ROOT_DIR/Portal/backend/Portal.API/Portal.API.csproj" \
  > "$LOG_DIR/portal-api.log" 2>&1 &
echo "  PID: $! | Log: .logs/portal-api.log"

sleep 1

echo -e "${CYAN}[Backend] Duyuru.API başlatılıyor...${NC}"
dotnet run --project "$ROOT_DIR/Duyuru/backend/Duyuru.API/Duyuru.API.csproj" \
  > "$LOG_DIR/duyuru-api.log" 2>&1 &
echo "  PID: $! | Log: .logs/duyuru-api.log"

sleep 1

echo -e "${CYAN}[Backend] Istatistik.API başlatılıyor...${NC}"
dotnet run --project "$ROOT_DIR/Istatistik/backend/Istatistik.API/Istatistik.API.csproj" \
  > "$LOG_DIR/istatistik-api.log" 2>&1 &
echo "  PID: $! | Log: .logs/istatistik-api.log"

sleep 1

echo -e "${CYAN}[Backend] Yardim.API başlatılıyor...${NC}"
dotnet run --project "$ROOT_DIR/Yardim/backend/Yardim.API/Yardim.API.csproj" \
  > "$LOG_DIR/yardim-api.log" 2>&1 &
echo "  PID: $! | Log: .logs/yardim-api.log"

echo ""
echo -e "${YELLOW}Backend servisler başlatıldı. Frontend için 3 saniye bekleniyor...${NC}"
sleep 3

# ─── FRONTEND SERVİSLERİ (orijinal portlar) ───────────────────
echo -e "${CYAN}[Frontend] Portal başlatılıyor (port 4200)...${NC}"
(cd "$ROOT_DIR/Portal/frontend" && npm run start -- --port 4200) \
  > "$LOG_DIR/portal-frontend.log" 2>&1 &
echo "  PID: $! | Log: .logs/portal-frontend.log"

echo -e "${CYAN}[Frontend] Duyuru başlatılıyor (port 4202)...${NC}"
(cd "$ROOT_DIR/Duyuru/frontend" && npm run start -- --port 4202) \
  > "$LOG_DIR/duyuru-frontend.log" 2>&1 &
echo "  PID: $! | Log: .logs/duyuru-frontend.log"

echo -e "${CYAN}[Frontend] Yardim başlatılıyor (port 4204)...${NC}"
(cd "$ROOT_DIR/Yardim/frontend" && npm run start -- --port 4204) \
  > "$LOG_DIR/yardim-frontend.log" 2>&1 &
echo "  PID: $! | Log: .logs/yardim-frontend.log"

echo -e "${CYAN}[Frontend] Istatistik başlatılıyor (port 4205)...${NC}"
(cd "$ROOT_DIR/Istatistik/frontend" && npm run start -- --port 4205) \
  > "$LOG_DIR/istatistik-frontend.log" 2>&1 &
echo "  PID: $! | Log: .logs/istatistik-frontend.log"

echo -e "${CYAN}[Frontend] Login başlatılıyor (port 4212)...${NC}"
(cd "$ROOT_DIR/Login/frontend" && npm run start -- --port 4212) \
  > "$LOG_DIR/login-frontend.log" 2>&1 &
echo "  PID: $! | Log: .logs/login-frontend.log"

echo ""
echo -e "${GREEN}=== Tüm servisler arka planda başlatıldı ===${NC}"
echo ""
echo "Frontend URL'leri:"
echo "  Portal     → http://localhost:4200  (Ana portal)"
echo "  Duyuru     → http://localhost:4202"
echo "  Yardim     → http://localhost:4204"
echo "  Istatistik → http://localhost:4205"
echo "  Login      → http://localhost:4212  (Giriş sayfası - buradan başlayın)"
echo ""
echo "Logları takip etmek için: tail -f $LOG_DIR/<servis>.log"
echo "Tüm servisleri durdurmak için: ./stop-all.sh"
