#!/bin/bash

echo "🚀 Sistema de Gestão de Empregabilidade - Setup"
echo "=============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado${NC}"
    echo "Instale Docker em: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado${NC}"
    echo "Instale Docker Compose em: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker e Docker Compose detectados${NC}"
echo ""

# Parar containers existentes
echo -e "${YELLOW}⏹️  Parando containers anteriores...${NC}"
docker-compose down 2>/dev/null

# Remover volumes antigos (opcional)
# docker-compose down -v

echo ""
echo -e "${YELLOW}🔨 Construindo imagens...${NC}"
docker-compose build --no-cache

echo ""
echo -e "${YELLOW}🚀 Iniciando serviços...${NC}"
docker-compose up -d

echo ""
echo -e "${YELLOW}⏳ Aguardando serviços iniciarem (30 segundos)...${NC}"
sleep 30

echo ""
echo -e "${GREEN}✅ Sistema iniciado com sucesso!${NC}"
echo ""
echo "📊 URLs Disponíveis:"
echo "  Frontend:        http://localhost:5173"
echo "  Auth Service:    http://localhost:3001"
echo "  Workers Service: http://localhost:3002"
echo "  Referrals Service: http://localhost:3003"
echo "  Assistance Service: http://localhost:3004"
echo "  Reports Service: http://localhost:3005"
echo ""

echo "🧪 Para rodar testes:"
echo "  npm test"
echo ""

echo "🛑 Para parar:"
echo "  docker-compose down"
echo ""

echo "📋 Para ver logs:"
echo "  docker-compose logs -f"
echo ""

# Verificar saúde dos serviços
echo -e "${YELLOW}📡 Verificando saúde dos serviços...${NC}"
echo ""

services=("3001" "3002" "3003" "3004" "3005" "5173")
for port in "${services[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health 2>/dev/null || echo "000")
    if [ "$response" = "200" ] || [ "$response" = "000" ]; then
        echo -e "${GREEN}✅ Porta $port: OK${NC}"
    else
        echo -e "${RED}❌ Porta $port: ERRO (HTTP $response)${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 Tudo pronto! Acesse: http://localhost:5173${NC}"
