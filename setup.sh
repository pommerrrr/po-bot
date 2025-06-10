#!/bin/bash

echo "🤖 Deriv Trading Bot - Setup"
echo "=============================="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js 18+ primeiro."
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale o npm primeiro."
    exit 1
fi

echo "✅ Node.js e npm encontrados"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "⚙️ Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado com configurações padrão"
else
    echo "⚙️ Arquivo .env já existe"
fi

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📝 Como usar:"
echo "1. npm run dev    # Iniciar em modo desenvolvimento"
echo "2. npm run build  # Compilar para produção"
echo "3. npm run preview # Visualizar build de produção"
echo ""
echo "🌐 O bot estará disponível em: http://localhost:5173"
echo ""
echo "⚠️  IMPORTANTE:"
echo "- Token já configurado: bbI0jJHJLY6EPxM"
echo "- Comece sempre em MODO DEMO"
echo "- Teste todas as configurações antes de usar dinheiro real"
echo ""
echo "📖 Leia o README.md para mais informações"
