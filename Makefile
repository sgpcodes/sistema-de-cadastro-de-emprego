.PHONY: help setup build up down logs clean test docker-build

help:
	@echo "Sistema de Gestão de Empregabilidade - Makefile"
	@echo "=============================================="
	@echo ""
	@echo "Comandos disponíveis:"
	@echo ""
	@echo "  make setup       - Configuração completa e inicia tudo"
	@echo "  make build       - Constrói imagens Docker"
	@echo "  make up          - Inicia containers"
	@echo "  make down        - Para containers"
	@echo "  make logs        - Mostra logs de todos os serviços"
	@echo "  make logs-auth   - Mostra logs do auth-service"
	@echo "  make test        - Roda testes"
	@echo "  make clean       - Remove containers e volumes"
	@echo "  make install     - Instala dependências localmente"
	@echo ""

setup: build up
	@echo ""
	@echo "✅ Sistema configurado e iniciado!"
	@echo ""
	@echo "Acesse: http://localhost:5173"
	@echo ""

build:
	@echo "🔨 Construindo imagens Docker..."
	docker-compose build --no-cache

up:
	@echo "🚀 Iniciando containers..."
	docker-compose up -d
	@echo "⏳ Aguardando 30 segundos..."
	sleep 30

down:
	@echo "🛑 Parando containers..."
	docker-compose down

logs:
	docker-compose logs -f

logs-auth:
	docker-compose logs -f auth-service

logs-workers:
	docker-compose logs -f workers-service

logs-referrals:
	docker-compose logs -f referrals-service

logs-assistance:
	docker-compose logs -f assistance-service

logs-reports:
	docker-compose logs -f reports-service

logs-frontend:
	docker-compose logs -f frontend

test:
	npm test --workspaces

test-coverage:
	npm run test:coverage --workspaces

install:
	npm install

clean:
	@echo "🧹 Limpando Docker..."
	docker-compose down -v
	docker system prune -f
	@echo "✅ Limpeza completa"

ps:
	docker-compose ps

shell-auth:
	docker-compose exec auth-service bash

shell-postgres:
	docker-compose exec postgres psql -U empregabilidade -d empregabilidade_db

health:
	@echo "🔍 Verificando saúde dos serviços..."
	@curl -s http://localhost:5173 && echo "✅ Frontend" || echo "❌ Frontend"
	@curl -s http://localhost:3001/health && echo "✅ Auth" || echo "❌ Auth"
	@curl -s http://localhost:3002/health && echo "✅ Workers" || echo "❌ Workers"
	@curl -s http://localhost:3003/health && echo "✅ Referrals" || echo "❌ Referrals"
	@curl -s http://localhost:3004/health && echo "✅ Assistance" || echo "❌ Assistance"
	@curl -s http://localhost:3005/health && echo "✅ Reports" || echo "❌ Reports"
