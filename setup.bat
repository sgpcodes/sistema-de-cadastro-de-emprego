@echo off
cls
echo.
echo 🚀 Sistema de Gestao de Empregabilidade - Setup
echo ============================================
echo.

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker nao esta instalado
    echo Instale em: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker detectado
echo.

REM Parar containers anteriores
echo ⏹️  Parando containers anteriores...
docker-compose down 2>nul

echo.
echo 🔨 Construindo imagens...
docker-compose build --no-cache

echo.
echo 🚀 Iniciando servicos...
docker-compose up -d

echo.
echo ⏳ Aguardando servicos iniciarem (30 segundos)...
timeout /t 30 /nobreak

echo.
echo ✅ Sistema iniciado com sucesso!
echo.
echo 📊 URLs Disponiveis:
echo   Frontend:        http://localhost:5173
echo   Auth Service:    http://localhost:3001
echo   Workers Service: http://localhost:3002
echo   Referrals Service: http://localhost:3003
echo   Assistance Service: http://localhost:3004
echo   Reports Service: http://localhost:3005
echo.

echo 🧪 Para rodar testes:
echo   npm test
echo.

echo 🛑 Para parar:
echo   docker-compose down
echo.

echo 📋 Para ver logs:
echo   docker-compose logs -f
echo.

echo 🎉 Tudo pronto! Acesse: http://localhost:5173
echo.
pause
