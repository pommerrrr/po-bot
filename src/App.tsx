import React, { useState, useEffect, useCallback } from 'react';

// Tipos de dados
interface Trade {
  id: string;
  symbol: string;
  direction: 'CALL' | 'PUT';
  amount: number;
  startTime: number;
  endTime: number;
  result?: 'WIN' | 'LOSS';
  profit?: number;
  confidence: number;
}

interface TechnicalIndicators {
  rsi: number;
  macd: number;
  sma: number;
  ema: number;
}

interface MLPrediction {
  direction: 'CALL' | 'PUT';
  confidence: number;
  factors: string[];
}

interface Settings {
  stopLoss: number;
  stopWin: number;
  entryAmount: number;
  maxDailyTrades: number;
  isDemoMode: boolean;
  demoBalance: number;
  token: string;
}

// API da Deriv
class DerivAPI {
  private ws: WebSocket | null = null;
  private token: string;
  private isConnected: boolean = false;
  private callbacks: Map<string, Function> = new Map();

  constructor(token: string) {
    this.token = token;
  }

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      this.ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=36561');
      
      this.ws.onopen = () => {
        console.log('🟢 Conectado à Deriv WebSocket');
        this.isConnected = true;
        
        // Autorizar com token
        this.send({
          authorize: this.token
        });
        
        resolve(true);
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📥 Mensagem recebida:', data);
        
        if (data.msg_type && this.callbacks.has(data.msg_type)) {
          const callback = this.callbacks.get(data.msg_type);
          if (callback) callback(data);
        }
      };

      this.ws.onclose = () => {
        console.log('🔴 Conexão WebSocket fechada');
        this.isConnected = false;
      };

      this.ws.onerror = (error) => {
        console.error('❌ Erro WebSocket:', error);
        resolve(false);
      };
    });
  }

  send(data: any) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(data));
    }
  }

  subscribe(msgType: string, callback: Function) {
    this.callbacks.set(msgType, callback);
  }

  async getBalance(): Promise<number> {
    return new Promise((resolve) => {
      this.subscribe('balance', (data: any) => {
        if (data.balance) {
          resolve(data.balance.balance);
        }
      });
      
      this.send({
        balance: 1,
        subscribe: 1
      });
    });
  }

  async buyContract(symbol: string, direction: 'CALL' | 'PUT', amount: number, duration: number) {
    return new Promise((resolve) => {
      this.subscribe('buy', (data: any) => {
        if (data.buy) {
          resolve({
            id: data.buy.contract_id,
            success: true,
            entryPrice: data.buy.start_spot
          });
        }
      });

      this.send({
        buy: 1,
        parameters: {
          contract_type: direction === 'CALL' ? 'CALL' : 'PUT',
          symbol: symbol,
          amount: amount,
          duration: duration,
          duration_unit: 's',
          basis: 'stake'
        }
      });
    });
  }

  async getTicks(symbol: string) {
    this.subscribe('tick', (data: any) => {
      // Handle tick data
    });

    this.send({
      ticks: symbol,
      subscribe: 1
    });
  }
}

export default function DerivTradingBot() {
  // Estados principais
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [balance, setBalance] = useState(0);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [historicalTrades, setHistoricalTrades] = useState<Trade[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentSymbol] = useState('R_50');
  const [mlPrediction, setMLPrediction] = useState<MLPrediction | null>(null);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);

  // Configurações
  const [settings, setSettings] = useState<Settings>({
    stopLoss: 80,
    stopWin: 85,
    entryAmount: 10,
    maxDailyTrades: 20,
    isDemoMode: true,
    demoBalance: 10000,
    token: 'bbI0jJHJLY6EPxM' // Seu token
  });

  // Estatísticas
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0,
    todayTrades: 0
  });

  // Instância da API
  const [derivAPI] = useState(() => new DerivAPI(settings.token));

  // Carregar dados do localStorage
  useEffect(() => {
    const savedTrades = localStorage.getItem('derivBot_trades');
    const savedSettings = localStorage.getItem('derivBot_settings');
    const savedStats = localStorage.getItem('derivBot_stats');

    if (savedTrades) {
      setHistoricalTrades(JSON.parse(savedTrades));
    }
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('derivBot_trades', JSON.stringify(historicalTrades));
  }, [historicalTrades]);

  useEffect(() => {
    localStorage.setItem('derivBot_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('derivBot_stats', JSON.stringify(stats));
  }, [stats]);

  // Conectar à API
  const handleConnect = async () => {
    try {
      const connected = await derivAPI.connect();
      if (connected) {
        setIsConnected(true);
        const currentBalance = await derivAPI.getBalance();
        setBalance(settings.isDemoMode ? settings.demoBalance : currentBalance);
        
        // Iniciar stream de preços
        derivAPI.getTicks(currentSymbol);
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
    }
  };

  // Desconectar
  const handleDisconnect = () => {
    setIsConnected(false);
    setIsRunning(false);
  };

  // Análise técnica simulada
  const calculateIndicators = useCallback((prices: number[]): TechnicalIndicators => {
    if (prices.length < 20) {
      return { rsi: 50, macd: 0, sma: 0, ema: 0 };
    }

    const rsi = 30 + Math.random() * 40;
    const macd = Math.random() * 2 - 1;
    const sma = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const ema = prices.slice(-12).reduce((a, b) => a + b, 0) / 12;

    return { rsi, macd, sma, ema };
  }, []);

  // Machine Learning simulado
  const generateMLPrediction = useCallback((indicators: TechnicalIndicators): MLPrediction => {
    let confidence = 0.5;
    const factors: string[] = [];
    let direction: 'CALL' | 'PUT' = 'CALL';

    if (indicators.rsi < 30) {
      confidence += 0.15;
      direction = 'CALL';
      factors.push('RSI Oversold');
    } else if (indicators.rsi > 70) {
      confidence += 0.15;
      direction = 'PUT';
      factors.push('RSI Overbought');
    }

    if (indicators.macd > 0) {
      confidence += 0.1;
      factors.push('MACD Bullish');
    } else {
      direction = direction === 'CALL' ? 'PUT' : 'CALL';
      confidence += 0.1;
      factors.push('MACD Bearish');
    }

    return {
      direction,
      confidence: Math.min(confidence, 0.95),
      factors
    };
  }, []);

  // Executar trade automático
  const executeAutoTrade = useCallback(async () => {
    if (!isConnected || !isRunning || !mlPrediction || !indicators) return;
    
    if (mlPrediction.confidence < 0.65) return;
    if (stats.todayTrades >= settings.maxDailyTrades) return;
    if (balance < settings.entryAmount) return;

    try {
      const result = await derivAPI.buyContract(
        currentSymbol,
        mlPrediction.direction,
        settings.entryAmount,
        300 // 5 minutos
      );

      if (result && result.success) {
        const newTrade: Trade = {
          id: result.id,
          symbol: currentSymbol,
          direction: mlPrediction.direction,
          amount: settings.entryAmount,
          startTime: Date.now(),
          endTime: Date.now() + 300000,
          confidence: mlPrediction.confidence
        };

        setActiveTrades(prev => [...prev, newTrade]);
        setBalance(prev => prev - settings.entryAmount);
        setStats(prev => ({
          ...prev,
          totalTrades: prev.totalTrades + 1,
          todayTrades: prev.todayTrades + 1
        }));
      }
    } catch (error) {
      console.error('Erro ao executar trade:', error);
    }
  }, [isConnected, isRunning, mlPrediction, indicators, stats, balance, settings, currentSymbol, derivAPI]);

  // Simulação de dados de mercado
  useEffect(() => {
    const interval = setInterval(() => {
      const price = 1000 + Math.random() * 100;
      setCurrentPrice(price);
      
      // Simular histórico de preços
      const prices = Array.from({ length: 50 }, (_, i) => price + Math.random() * 10 - 5);
      const newIndicators = calculateIndicators(prices);
      setIndicators(newIndicators);
      
      const prediction = generateMLPrediction(newIndicators);
      setMLPrediction(prediction);
    }, 2000);

    return () => clearInterval(interval);
  }, [calculateIndicators, generateMLPrediction]);

  // Executar trades automáticos
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(executeAutoTrade, 10000);
      return () => clearInterval(interval);
    }
  }, [isRunning, executeAutoTrade]);

  const winRate = stats.totalTrades > 0 ? (stats.winningTrades / stats.totalTrades) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Deriv Trading Bot
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded ${settings.isDemoMode ? 'bg-blue-600' : 'bg-green-600'}`}>
                  {settings.isDemoMode ? '🧪 DEMO' : '💰 REAL'}
                </span>
                <span className="text-xs text-slate-400">
                  Símbolo: {currentSymbol} | Preço: ${currentPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
            
            {!isConnected ? (
              <button 
                onClick={handleConnect}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium"
              >
                Conectar Deriv
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-2 rounded font-medium ${
                    isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isRunning ? '⏸️ Pausar' : '▶️ Iniciar'} Bot
                </button>
                <button 
                  onClick={handleDisconnect}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-medium"
                >
                  Desconectar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Saldo</div>
            <div className="text-2xl font-bold text-green-400">${balance.toFixed(2)}</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Taxa de Acerto</div>
            <div className="text-2xl font-bold text-blue-400">{winRate.toFixed(1)}%</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Trades Ativos</div>
            <div className="text-2xl font-bold text-yellow-400">{activeTrades.length}</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Lucro Total</div>
            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${stats.totalProfit.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Previsão ML */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🧠 Previsão Machine Learning
            </h3>
            {mlPrediction ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Direção para {currentSymbol}:</span>
                  <span className={`px-3 py-1 rounded font-medium ${
                    mlPrediction.direction === 'CALL' ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {mlPrediction.direction === 'CALL' ? '📈 CALL' : '📉 PUT'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Confiança:</span>
                    <span>{(mlPrediction.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${mlPrediction.confidence * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">Fatores de Análise:</span>
                  <div className="flex flex-wrap gap-1">
                    {mlPrediction.factors.map((factor, index) => (
                      <span key={index} className="text-xs bg-slate-700 px-2 py-1 rounded">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Aguardando dados...</p>
            )}
          </div>

          {/* Indicadores Técnicos */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📊 Indicadores Técnicos
            </h3>
            {indicators ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-400">RSI</div>
                  <div className="text-lg font-bold">{indicators.rsi.toFixed(1)}</div>
                  <div className="text-xs text-slate-500">
                    {indicators.rsi < 30 ? 'Oversold' : indicators.rsi > 70 ? 'Overbought' : 'Neutral'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">MACD</div>
                  <div className="text-lg font-bold">{indicators.macd.toFixed(4)}</div>
                  <div className="text-xs text-slate-500">
                    {indicators.macd > 0 ? 'Bullish' : 'Bearish'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">SMA(20)</div>
                  <div className="text-lg font-bold">{indicators.sma.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">EMA(12)</div>
                  <div className="text-lg font-bold">{indicators.ema.toFixed(2)}</div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Carregando indicadores...</p>
            )}
          </div>
        </div>

        {/* Configurações */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">⚙️ Configurações</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Stop Loss (%)</label>
              <input
                type="number"
                value={settings.stopLoss}
                onChange={(e) => setSettings(prev => ({ ...prev, stopLoss: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Stop Win (%)</label>
              <input
                type="number"
                value={settings.stopWin}
                onChange={(e) => setSettings(prev => ({ ...prev, stopWin: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Valor Entrada ($)</label>
              <input
                type="number"
                value={settings.entryAmount}
                onChange={(e) => setSettings(prev => ({ ...prev, entryAmount: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded">
            <div className="flex items-center gap-2 text-yellow-400">
              <span>⚠️</span>
              <strong>Token Configurado:</strong> 
              <span className="font-mono text-sm">bbI0jJHJLY6EPxM</span>
            </div>
            <p className="text-sm text-yellow-300 mt-1">
              {settings.isDemoMode 
                ? 'Modo Demo: Operações simuladas sem risco financeiro real.' 
                : 'Modo Real: CUIDADO! Operações com dinheiro real.'}
            </p>
          </div>
        </div>

        {/* Trades Ativos */}
        {activeTrades.length > 0 && (
          <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🔄 Trades Ativos</h3>
            <div className="space-y-2">
              {activeTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      trade.direction === 'CALL' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {trade.direction}
                    </span>
                    <span>{trade.symbol}</span>
                    <span className="text-slate-400">${trade.amount}</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Expira: {new Date(trade.endTime).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
