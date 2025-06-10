# 🚀 Deploy do Deriv Trading Bot

## 📦 Opções de Deploy

### 1. Vercel (Recomendado)

#### Método Rápido:
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy
vercel --prod
```

#### Método GitHub:
1. Suba o código para o GitHub
2. Vá em vercel.com
3. Importe o repositório
4. Deploy automático!

### 2. Netlify

```bash
# 1. Build do projeto
npm run build

# 2. Suba a pasta 'dist' no Netlify
# Ou conecte com GitHub para deploy automático
```

### 3. GitHub Pages

```bash
# 1. Instalar gh-pages
npm install --save-dev gh-pages

# 2. Adicionar no package.json:
"homepage": "https://seuusuario.github.io/deriv-trading-bot",
"scripts": {
  "deploy": "gh-pages -d dist"
}

# 3. Build e deploy
npm run build
npm run deploy
```

### 4. Hospedagem Local

```bash
# Iniciar servidor local
npm run dev

# Ou build para produção local
npm run build
npm run preview
```

## ⚙️ Variáveis de Ambiente

Para produção, configure estas variáveis:

```env
VITE_DERIV_TOKEN=bbI0jJHJLY6EPxM
VITE_DERIV_APP_ID=36561
VITE_TRADING_MODE=demo
```

## 🔧 Configuração Específica por Plataforma

### Vercel
- Arquivo `vercel.json` já configurado
- Variables de ambiente automáticas
- Build command: `npm run build`
- Output directory: `dist`

### Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18+

### GitHub Pages
- Precisa configurar base URL no vite.config.ts
- Funciona apenas com HTTPS

## 🌐 URLs de Teste

Depois do deploy, teste estas funcionalidades:

1. **Conexão API**: Bot deve conectar automaticamente
2. **Modo Demo**: Verificar se está ativo por padrão
3. **WebSocket**: Dados de mercado em tempo real
4. **Interface**: Responsividade mobile/desktop

## 🔐 Segurança

### Modo Demo (Padrão)
- ✅ Sem riscos financeiros
- ✅ Token visível no código (normal)
- ✅ Dados simulados

### Modo Real (Cuidado!)
- ⚠️ **NUNCA** exponha token real em código público
- ⚠️ Use variáveis de ambiente privadas
- ⚠️ Ative apenas após testes extensivos

## 📱 Compatibilidade

### Desktop
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Resolução mínima: 1024x768

### Mobile
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+
- ✅ Interface responsiva

### APIs
- ✅ WebSocket support necessário
- ✅ CORS habilitado para deriv.com
- ✅ HTTPS requerido em produção

## 🚨 Troubleshooting

### Erro de Conexão WebSocket
```javascript
// Verificar se está em HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  alert('WebSocket requer HTTPS em produção');
}
```

### Token Inválido
- Verificar se token não expirou
- Testar em https://api.deriv.com/api-explorer
- Gerar novo token se necessário

### Build Falha
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

## ✅ Checklist de Deploy

- [ ] Código testado localmente
- [ ] Build sem erros
- [ ] Token configurado
- [ ] Modo demo ativo
- [ ] Interface responsiva
- [ ] WebSocket conectando
- [ ] Dados atualizando
- [ ] Configurações salvando
- [ ] README atualizado
- [ ] Documentação completa

## 🎯 URLs Úteis

- **API Deriv**: https://api.deriv.com/
- **WebSocket Tester**: https://developers.deriv.com/
- **Community**: https://community.deriv.com/
- **App Registration**: https://app.deriv.com/account/api-token

---

**🎉 Boa sorte com seu bot de trading!**
