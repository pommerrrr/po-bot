# 🤖 Deriv Trading Bot

Bot automatizado de trading para a plataforma Deriv com análises técnicas e machine learning.

## ✨ Características Principais

- 🔗 **API da Deriv**: Integração direta via WebSocket
- 🧠 **Machine Learning**: Análises inteligentes para previsões
- 📊 **Análise Técnica**: RSI, MACD, SMA, EMA
- 🎯 **Stop Loss/Win**: Gerenciamento automático de risco
- 🧪 **Modo Demo**: Teste sem riscos
- 💰 **Modo Real**: Trading com dinheiro real
- 📱 **Interface Web**: Dashboard completo e responsivo

## 🚀 Como Usar

### 1. Configuração
- Token da Deriv já configurado: `bbI0jJHJLY6EPxM`
- Escolha entre modo Demo ou Real
- Configure valores de Stop Loss/Win
- Defina valor das entradas

### 2. Execução
```bash
npm install
npm run dev
```

### 3. Acesso
Abra http://localhost:5173 no navegador

## ⚙️ Configurações Recomendadas

### Para Iniciantes (Modo Demo)
- Stop Loss: 80%
- Stop Win: 85%
- Valor Entrada: $10
- Max Trades/Dia: 10

### Para Experientes (Modo Real)
- Stop Loss: 70%
- Stop Win: 90%
- Valor Entrada: $25+
- Max Trades/Dia: 20

## 📊 Indicadores Técnicos

- **RSI**: Relative Strength Index (30-70)
- **MACD**: Moving Average Convergence Divergence
- **SMA**: Simple Moving Average (20 períodos)
- **EMA**: Exponential Moving Average (12 períodos)

## 🧠 Machine Learning

O bot usa algoritmos de aprendizado para:
- Analisar padrões históricos
- Calcular probabilidades de sucesso
- Adaptar estratégias baseadas em resultados
- Otimizar pontos de entrada/saída

## ⚠️ Avisos Importantes

### Modo Demo
- ✅ Sem riscos financeiros
- ✅ Teste todas as configurações
- ✅ Aprenda como funciona
- ✅ Validação de estratégias

### Modo Real
- ⚠️ **RISCO REAL**: Pode perder dinheiro
- ⚠️ **TESTE ANTES**: Use modo demo extensivamente
- ⚠️ **INVISTA CONSCIENTEMENTE**: Apenas o que pode perder
- ⚠️ **ACOMPANHE**: Monitor os resultados constantemente

## 🔧 Estrutura do Projeto

```
deriv-trading-bot/
├── src/
│   ├── App.tsx          # Componente principal do bot
│   ├── main.tsx         # Ponto de entrada React
│   └── index.css        # Estilos Tailwind + custom
├── package.json         # Dependências e scripts
├── vite.config.ts       # Configuração Vite
├── tailwind.config.js   # Configuração Tailwind
└── README.md           # Este arquivo
```

## 🌐 API da Deriv

- **WebSocket**: `wss://ws.binaryws.com/websockets/v3`
- **App ID**: `36561`
- **Token**: Configurado automaticamente
- **Símbolos**: R_50, R_75, R_100 (Índices Sintéticos)

## 📈 Estratégias Suportadas

1. **Análise de Tendência**
   - MACD Crossover
   - SMA/EMA Signals

2. **Momentum**
   - RSI Oversold/Overbought
   - Price Action Patterns

3. **Reversal**
   - Support/Resistance Levels
   - Bollinger Bands (implementação futura)

## 🔮 Recursos Futuros

- [ ] Mais indicadores técnicos
- [ ] Estratégias customizáveis
- [ ] Backtesting histórico
- [ ] Alertas por Telegram/WhatsApp
- [ ] Multi-símbolo trading
- [ ] Copy trading

## 📞 Suporte

- **Deriv API Docs**: https://api.deriv.com/
- **WebSocket API**: https://developers.deriv.com/
- **Comunidade**: https://community.deriv.com/

## ⚖️ Disclaimer

Este bot é para fins educacionais e de automação. Trading envolve riscos significativos. 
Sempre teste em modo demo antes de usar dinheiro real. O desenvolvedor não se responsabiliza por perdas financeiras.

---

**🎯 Desenvolvido especificamente para brasileiros que usam a Deriv!**
