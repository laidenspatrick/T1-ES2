.PHONY: setup up down logs reset health

ENV_FILE := .env

setup: check-env up
	@echo ""
	@echo "✅ Ambiente iniciado com sucesso!"
	@echo ""
	@echo "   Shell:        http://localhost:3000"
	@echo "   Auth API:     http://localhost:3001"
	@echo "   Swagger:      http://localhost:3001/docs"
	@echo "   MFE Auth:     http://localhost:4001"
	@echo ""

check-env:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "⚠️  Arquivo .env não encontrado. Copiando .env.example..."; \
		cp .env.example .env; \
		echo "✅ .env criado. Edite se necessário e rode 'make setup' novamente."; \
	fi

up:
	@echo "🚀 Iniciando serviços..."
	docker compose --env-file $(ENV_FILE) up -d --build

down:
	@echo "🛑 Parando serviços..."
	docker compose down

logs:
	docker compose logs -f

logs-auth:
	docker compose logs -f chave-ms-auth

reset:
	@echo "🔄 Reset completo..."
	docker compose down -v
	docker compose --env-file $(ENV_FILE) up -d --build

health:
	@echo "Verificando serviços..."
	@curl -sf http://localhost:3001/health && echo "✅ chave-ms-auth OK" || echo "❌ chave-ms-auth INDISPONÍVEL"
	@curl -sf http://localhost:4001 > /dev/null && echo "✅ chave-mfe-auth OK" || echo "❌ chave-mfe-auth INDISPONÍVEL"
	@curl -sf http://localhost:3000 > /dev/null && echo "✅ chave-shell OK" || echo "❌ chave-shell INDISPONÍVEL"