#!/bin/bash
# Kadastro Portal - Tüm servisleri durdur

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}=== Kadastro Portal Durduruluyor ===${NC}"

# .NET backend süreçleri durdur
echo "Backend .NET süreçleri durduruluyor..."
pkill -f "Gateway/Gateway" 2>/dev/null
pkill -f "Login.API/Login.API" 2>/dev/null
pkill -f "Portal.API/Portal.API" 2>/dev/null
pkill -f "Duyuru.API/Duyuru.API" 2>/dev/null
pkill -f "Istatistik.API/Istatistik.API" 2>/dev/null
pkill -f "Yardim.API/Yardim.API" 2>/dev/null

# Angular frontend süreçleri durdur
echo "Frontend Angular süreçleri durduruluyor..."
pkill -f "Login/frontend" 2>/dev/null
pkill -f "Portal/frontend" 2>/dev/null
pkill -f "Duyuru/frontend" 2>/dev/null
pkill -f "Istatistik/frontend" 2>/dev/null
pkill -f "Yardim/frontend" 2>/dev/null

echo -e "${GREEN}Tüm servisler durduruldu.${NC}"
