# 🔧 TROUBLESHOOTING - Soluções para Erros Comuns

## Erro: `target auth-service: failed to solve`

### Causas comuns:
1. Versão antiga do Docker
2. Problema com NPM cache
3. Memória insuficiente

### Soluções:

**Opção 1: Limpar cache Docker e reconstruir**
```bash
docker-compose down -v
docker system prune -f
docker-compose build --no-cache --progress=plain
docker-compose up -d
```

**Opção 2: Aumentar memória Docker**
- No Docker Desktop: Settings > Resources > Memory (mínimo 4GB)
- Reinicie Docker após a mudança

**Opção 3: Tentar novamente com paciência**
```bash
docker-compose build
# Aguarde completar (pode levar 3-5 minutos na primeira vez)
docker-compose up -d
```

---

## Erro: `Connection refused on port 5432`

### Causa: PostgreSQL não iniciou

### Solução:
```bash
# Verificar status do PostgreSQL
docker-compose ps postgres

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar apenas PostgreSQL
docker-compose restart postgres

# Aguardar 10 segundos e então:
docker-compose up -d
```

---

## Erro: `Port 5173 already in use`

### Causa: Outro processo usando a porta

### Solução:

**macOS/Linux:**
```bash
# Encontrar processo na porta 5173
lsof -i :5173

# Matar o processo
kill -9 <PID>

# Ou alterar porta no docker-compose.yml:
# Mudar "5173:5173" para "5174:5173"
```

**Windows:**
```bash
# Encontrar processo
netstat -ano | findstr :5173

# Matar o processo
taskkill /PID <PID> /F
```

---

## Erro: `npm ERR! code ERESOLVE`

### Causa: Conflito de dependências

### Solução:
```bash
# Remover package-lock.json
rm -rf services/*/package-lock.json
rm apps/frontend/package-lock.json

# Reconstruir
docker-compose down
docker-compose build --no-cache
```

---

## Frontend não carrega (erro 502 Bad Gateway)

### Causa: Serviços backend não respondendo

### Solução:
```bash
# Verificar se todos os serviços estão rodando
docker-compose ps

# Se algum está parado, reiniciar tudo
docker-compose down
docker-compose up -d

# Aguardar 30 segundos e recarregar página
```

---

## Erro: `ECONNREFUSED` ao acessar API

### Causa: Frontend não consegue conectar ao backend

### Solução:

**1. Verificar se backend está rodando:**
```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
# ... etc
```

**2. Aguardar inicialização completa:**
Os serviços levam ~30 segundos para ficar prontos

**3. Verificar variáveis de ambiente:**
```bash
# Checar .env files
cat services/auth/.env
```

---

## Banco de dados vazio (sem tabelas)

### Causa: Script init.sql não executou

### Solução:
```bash
# Executar script manualmente
docker-compose exec postgres psql -U empregabilidade -d empregabilidade_db < services/shared/database/init.sql

# Ou conectar e executar direto
docker-compose exec postgres psql -U empregabilidade -d empregabilidade_db

# Dentro do psql, colar conteúdo de services/shared/database/init.sql
```

---

## Testes falhando

### Causa 1: Dependências não instaladas
```bash
npm install
npm test
```

### Causa 2: Banco de dados não está rodando
```bash
docker-compose up postgres -d
npm test
```

### Causa 3: Cache antigo
```bash
npm test -- --clearCache
npm test
```

---

## Docker Compose não inicia

### Verificar arquivo docker-compose.yml
```bash
# Validar sintaxe
docker-compose config

# Se houver erro, corrigir indentação (YAML é sensível)
```

---

## Memory issues / "Killed"

### Causa: Container sem memória suficiente

### Solução:

**Opção 1: Aumentar limite no docker-compose.yml**
```yaml
services:
  auth-service:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

**Opção 2: Aumentar memória do Docker Desktop**
- Settings > Resources > Memory (5GB ou mais)

**Opção 3: Rodar serviços em paralelo local**
```bash
npm run dev  # ao invés de docker-compose
```

---

## Volumes persistindo dados antigos

### Se quer começar do zero:
```bash
docker-compose down -v
docker-compose up -d
```

---

## Health check falhando

Se você vê `(health: starting)` por muito tempo:

```bash
# Aumentar timeout do health check no docker-compose.yml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U empregabilidade"]
  interval: 10s
  timeout: 10s        # aumentar de 5s
  retries: 10         # aumentar de 5
  start_period: 20s   # adicionar este
```

---

## Logs não mostram mensagens úteis

```bash
# Ver logs com mais contexto
docker-compose logs -f --tail=100

# Logs de um serviço específico
docker-compose logs -f auth-service --tail=50
```

---

## Ainda não funciona?

### Fazer reset completo:
```bash
# Parar tudo
docker-compose down -v

# Remover todas as imagens
docker-compose build --no-cache --pull

# Limpar sistema Docker
docker system prune -f

# Reconstruir do zero
docker-compose up -d --build

# Aguardar 60 segundos
sleep 60

# Testar
curl http://localhost:3001/health
```

---

## Suporte

Se o problema persistir:

1. Verifique a versão do Docker: `docker --version` (mínimo 20.10)
2. Verifique espaço em disco: `df -h`
3. Reinicie Docker Desktop completamente
4. Verifique logs detalhados: `docker-compose logs -f`
5. Procure o erro específico neste arquivo

---

**Última atualização**: 2026-06-05
