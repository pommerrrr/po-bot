import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  TrendingUp, 
  TrendingDown, 
  Bot, 
  Settings, 
  BarChart3, 
  Wallet, 
  Target,
  Brain,
  Activity,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  TestTube,
  DollarSign,
  Shield,
  Clock,
  BarChart2
} from "lucide-react";

// Tipos de dados
interface Trade {
  id: string;
  asset: string;
  direction: 'CALL' | 'PUT';
  amount: number;
  entryTime: number;
  entryPrice: number;
  expiryTime: number;
  result?: 'WIN' | 'LOSS';
  profit?: number;
  confidence: number;
}

interface TechnicalIndicators {
  rsi: number;
  macd: { signal: number; histogram: number };
  bollinger: { upper: number; middle: number; lower: number };
  sma20: number;
  ema12: number;
  volume: number;
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
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  enableML: boolean;
  minConfidence: number;
  isDemoMode: boolean;
  demoBalance: number;
}

interface TestSession {
  id: string;
  startTime: number;
  endTime?: number;
  initialBalance: number;
  finalBalance?: number;
  totalTrades: number;
  winRate: number;
  maxDrawdown: number;
  strategy: string;
}

// Simulador de dados de mercado (em um cenário real, viria da API)
const generateMarketData = () => {
  const basePrice = 1.2000 + Math.random() * 0.01;
  return {
    price: basePrice,
    timestamp: Date.now(),
    volume: Math.floor(Math.random() * 1000) + 500
  };
};

// Análise técnica simulada
const calculateTechnicalIndicators = (prices: number[]): TechnicalIndicators => {
  if (prices.length < 20) {
    return {
      rsi: 50,
      macd: { signal: 0, histogram: 0 },
      bollinger: { upper: 0, middle: 0, lower: 0 },
      sma20: 0,
      ema12: 0,
      volume: 0
    };
  }

  // RSI simplificado
  const rsi = 30 + Math.random() * 40; // Entre 30-70

  // MACD simplificado
  const macd = {
    signal: Math.random() * 2 - 1,
    histogram: Math.random() * 0.5 - 0.25
  };

  // Bollinger Bands
  const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const stdDev = Math.sqrt(prices.slice(-20).reduce((sum, price) => sum + Math.pow(price - sma20, 2), 0) / 20);
  
  return {
    rsi,
    macd,
    bollinger: {
      upper: sma20 + (stdDev * 2),
      middle: sma20,
      lower: sma20 - (stdDev * 2)
    },
    sma20,
    ema12: prices.slice(-12).reduce((a, b) => a + b, 0) / 12,
    volume: Math.floor(Math.random() * 1000) + 500
  };
};

// Machine Learning simulado
const generateMLPrediction = (indicators: TechnicalIndicators, historicalTrades: Trade[]): MLPrediction => {
  let confidence = 0.5;
  const factors: string[] = [];
  let direction: 'CALL' | 'PUT' = 'CALL';

  // Análise baseada em RSI
  if (indicators.rsi < 30) {
    confidence += 0.15;
    direction = 'CALL';
    factors.push('RSI Oversold');
  } else if (indicators.rsi > 70) {
    confidence += 0.15;
    direction = 'PUT';
    factors.push('RSI Overbought');
  }

  // Análise MACD
  if (indicators.macd.histogram > 0) {
    confidence += 0.1;
    factors.push('MACD Bullish');
  } else {
    direction = direction === 'CALL' ? 'PUT' : 'CALL';
    confidence += 0.1;
    factors.push('MACD Bearish');
  }

  // Aprendizado com trades anteriores
  const recentTrades = historicalTrades.slice(-10);
  const winRate = recentTrades.filter(t => t.result === 'WIN').length / recentTrades.length;
  
  if (winRate > 0.7) {
    confidence += 0.1;
    factors.push('High Recent Win Rate');
  } else if (winRate < 0.3) {
    confidence -= 0.1;
    factors.push('Low Recent Win Rate');
  }

  return {
    direction,
    confidence: Math.min(confidence, 0.95),
    factors
  };
};

// Simulador da API Pocket Option
const pocketOptionAPI = {
  connect: async () => {
    console.log('Conectando à Pocket Option...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  },
  
  getBalance: async () => {
    return 1000 + Math.random() * 500; // Saldo simulado
  },
  
  placeTrade: async (asset: string, direction: 'CALL' | 'PUT', amount: number, duration: number) => {
    console.log(`Executando trade: ${direction} ${asset} $${amount} por ${duration}s`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: Date.now().toString(),
      success: true,
      entryPrice: 1.2000 + Math.random() * 0.01
    };
  },
  
  getActiveAssets: async () => {
    return ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  }
};

export default function PocketOptionTradingBot() {
  // Estados principais
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [balance, setBalance] = useState(0);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [historicalTrades, setHistoricalTrades] = useState<Trade[]>([]);
  const [currentIndicators, setCurrentIndicators] = useState<TechnicalIndicators | null>(null);
  const [mlPrediction, setMLPrediction] = useState<MLPrediction | null>(null);
  const [marketPrices, setMarketPrices] = useState<number[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentAsset, setCurrentAsset] = useState('EURUSD');
  const [availableAssets] = useState(['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD']);
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);

  // Configurações
  const [settings, setSettings] = useState<Settings>({
    stopLoss: 80,
    stopWin: 85,
    entryAmount: 10,
    maxDailyTrades: 20,
    riskLevel: 'MEDIUM',
    enableML: true,
    minConfidence: 0.65,
    isDemoMode: true,
    demoBalance: 10000
  });

  // Estatísticas
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0,
    todayTrades: 0
  });

  // Carregar dados do localStorage
  useEffect(() => {
    const savedTrades = localStorage.getItem('tradingBot_trades');
    const savedSettings = localStorage.getItem('tradingBot_settings');
    const savedStats = localStorage.getItem('tradingBot_stats');
    const savedSessions = localStorage.getItem('tradingBot_testSessions');

    if (savedTrades) {
      setHistoricalTrades(JSON.parse(savedTrades));
    }
    if (savedSettings) {
      const loadedSettings = JSON.parse(savedSettings);
      // Garantir compatibilidade com versões antigas
      setSettings({
        ...loadedSettings,
        isDemoMode: loadedSettings.isDemoMode ?? true,
        demoBalance: loadedSettings.demoBalance ?? 10000
      });
    }
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    if (savedSessions) {
      setTestSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('tradingBot_trades', JSON.stringify(historicalTrades));
  }, [historicalTrades]);

  useEffect(() => {
    localStorage.setItem('tradingBot_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('tradingBot_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('tradingBot_testSessions', JSON.stringify(testSessions));
  }, [testSessions]);

  // Atualização dos dados de mercado
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateMarketData();
      setCurrentPrice(newData.price);
      setMarketPrices(prev => [...prev.slice(-99), newData.price]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Análise técnica contínua
  useEffect(() => {
    if (marketPrices.length > 20) {
      const indicators = calculateTechnicalIndicators(marketPrices);
      setCurrentIndicators(indicators);
      
      if (settings.enableML) {
        const prediction = generateMLPrediction(indicators, historicalTrades);
        setMLPrediction(prediction);
      }
    }
  }, [marketPrices, settings.enableML, historicalTrades]);

  // Inicializar sessão de teste demo
  const startTestSession = () => {
    const session: TestSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      initialBalance: settings.isDemoMode ? settings.demoBalance : balance,
      totalTrades: 0,
      winRate: 0,
      maxDrawdown: 0,
      strategy: `ML_${settings.riskLevel}_${settings.minConfidence}`
    };
    setCurrentSession(session);
    if (settings.isDemoMode) {
      setBalance(settings.demoBalance);
    }
  };

  // Finalizar sessão de teste
  const endTestSession = () => {
    if (currentSession) {
      const finalSession: TestSession = {
        ...currentSession,
        endTime: Date.now(),
        finalBalance: balance,
        totalTrades: stats.totalTrades,
        winRate: stats.totalTrades > 0 ? (stats.winningTrades / stats.totalTrades) * 100 : 0,
        maxDrawdown: ((currentSession.initialBalance - Math.min(...[currentSession.initialBalance, balance])) / currentSession.initialBalance) * 100
      };
      setTestSessions(prev => [...prev, finalSession]);
      setCurrentSession(null);
    }
  };

  // Conectão específica para modo demo/real
  const handleConnect = async () => {
    try {
      if (settings.isDemoMode) {
        // Simulação de conexão demo
        console.log('Conectando à conta DEMO da Pocket Option...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsConnected(true);
        setBalance(settings.demoBalance);
        startTestSession();
      } else {
        // Conexão real (futura implementação)
        const connected = await pocketOptionAPI.connect();
        if (connected) {
          setIsConnected(true);
          const currentBalance = await pocketOptionAPI.getBalance();
          setBalance(currentBalance);
        }
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
    }
  };

  // Toggle entre modo demo e real
  const toggleDemoMode = () => {
    if (isConnected || isRunning) {
      alert('Desconecte o bot antes de alterar o modo!');
      return;
    }
    setSettings(prev => ({ ...prev, isDemoMode: !prev.isDemoMode }));
    setBalance(0);
    setHistoricalTrades([]);
    setActiveTrades([]);
    setStats({
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      todayTrades: 0
    });
  };

  // Execução de trade automático
  const executeAutoTrade = useCallback(async () => {
    if (!isConnected || !isRunning || !currentIndicators || !mlPrediction) return;
    
    // Verificar condições de entrada
    if (mlPrediction.confidence < settings.minConfidence) return;
    if (stats.todayTrades >= settings.maxDailyTrades) return;
    if (balance < settings.entryAmount) return;

    try {
      const result = await pocketOptionAPI.placeTrade(
        currentAsset,
        mlPrediction.direction,
        settings.entryAmount,
        300 // 5 minutos
      );

      if (result.success) {
        const newTrade: Trade = {
          id: result.id,
          asset: currentAsset,
          direction: mlPrediction.direction,
          amount: settings.entryAmount,
          entryTime: Date.now(),
          entryPrice: result.entryPrice,
          expiryTime: Date.now() + 300000,
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
  }, [isConnected, isRunning, currentIndicators, mlPrediction, settings, stats, balance, currentAsset]);

  // Verificar resultados de trades ativos
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expiredTrades = activeTrades.filter(trade => now >= trade.expiryTime);
      
      expiredTrades.forEach(trade => {
        // Simular resultado do trade
        const isWin = Math.random() < (trade.confidence * 0.8); // Correlação com confiança
        const profit = isWin ? trade.amount * 0.85 : -trade.amount;
        
        const completedTrade: Trade = {
          ...trade,
          result: isWin ? 'WIN' : 'LOSS',
          profit
        };

        setHistoricalTrades(prev => [...prev, completedTrade]);
        setBalance(prev => prev + (isWin ? trade.amount + profit : 0));
        setStats(prev => ({
          ...prev,
          winningTrades: isWin ? prev.winningTrades + 1 : prev.winningTrades,
          losingTrades: isWin ? prev.losingTrades : prev.losingTrades + 1,
          totalProfit: prev.totalProfit + profit
        }));
      });

      if (expiredTrades.length > 0) {
        setActiveTrades(prev => prev.filter(trade => now < trade.expiryTime));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTrades]);

  // Executar trades automáticos
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(executeAutoTrade, 10000); // A cada 10 segundos
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
            <Bot className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Pocket Option Trading Bot
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={settings.isDemoMode ? "secondary" : "default"} className="text-xs">
                  {settings.isDemoMode ? (
                    <><TestTube className="h-3 w-3 mr-1" /> MODO DEMO</>
                  ) : (
                    <><DollarSign className="h-3 w-3 mr-1" /> CONTA REAL</>
                  )}
                </Badge>
                {currentSession && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Sessão: {Math.floor((Date.now() - currentSession.startTime) / 60000)}min
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Toggle Demo/Real */}
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2 border border-slate-700">
              <DollarSign className="h-4 w-4 text-green-400" />
              <Switch
                checked={settings.isDemoMode}
                onCheckedChange={toggleDemoMode}
                disabled={isConnected || isRunning}
              />
              <TestTube className="h-4 w-4 text-blue-400" />
            </div>

            <Badge variant={isConnected ? "default" : "destructive"} className="px-3 py-1">
              {isConnected ? "Conectado" : "Desconectado"}
            </Badge>
            
            {!isConnected ? (
              <Button onClick={handleConnect} variant="outline">
                Conectar {settings.isDemoMode ? 'Demo' : 'Real'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  variant={isRunning ? "destructive" : "default"}
                  className="flex items-center gap-2"
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isRunning ? 'Pausar Bot' : 'Iniciar Bot'}
                </Button>
                {settings.isDemoMode && currentSession && (
                  <Button onClick={endTestSession} variant="outline" size="sm">
                    Finalizar Teste
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <Wallet className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">${balance.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
              <Target className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{winRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trades Ativos</CardTitle>
              <Activity className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{activeTrades.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.totalProfit.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            {settings.isDemoMode && <TabsTrigger value="demo">Demo</TabsTrigger>}
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Previsão ML */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    Previsão Machine Learning
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {currentAsset}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Preço: ${currentPrice.toFixed(5)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mlPrediction ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Direção para {currentAsset}:</span>
                        <Badge variant={mlPrediction.direction === 'CALL' ? "default" : "destructive"}>
                          {mlPrediction.direction === 'CALL' ? (
                            <><TrendingUp className="h-3 w-3 mr-1" /> CALL</>
                          ) : (
                            <><TrendingDown className="h-3 w-3 mr-1" /> PUT</>
                          )}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Confiança:</span>
                          <span>{(mlPrediction.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={mlPrediction.confidence * 100} className="h-2" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-medium">Fatores de Análise:</span>
                        {mlPrediction.factors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400">Aguardando dados suficientes para {currentAsset}...</p>
                  )}
                </CardContent>
              </Card>

              {/* Indicadores Técnicos */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    Indicadores Técnicos
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <select 
                      value={currentAsset}
                      onChange={(e) => setCurrentAsset(e.target.value)}
                      className="bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-sm"
                    >
                      {availableAssets.map(asset => (
                        <option key={asset} value={asset}>{asset}</option>
                      ))}
                    </select>
                    <RefreshCw className="h-3 w-3 animate-spin text-blue-400" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentIndicators ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">RSI</Label>
                          <div className="text-lg font-bold">{currentIndicators.rsi.toFixed(1)}</div>
                          <div className="text-xs text-slate-400">
                            {currentIndicators.rsi < 30 ? 'Oversold' : currentIndicators.rsi > 70 ? 'Overbought' : 'Neutral'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">MACD</Label>
                          <div className="text-lg font-bold">{currentIndicators.macd.signal.toFixed(4)}</div>
                          <div className="text-xs text-slate-400">
                            {currentIndicators.macd.histogram > 0 ? 'Bullish' : 'Bearish'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">SMA(20)</Label>
                          <div className="text-lg font-bold">{currentIndicators.sma20.toFixed(5)}</div>
                          <div className="text-xs text-slate-400">Média 20 períodos</div>
                        </div>
                        <div>
                          <Label className="text-sm">Preço Atual ({currentAsset})</Label>
                          <div className="text-lg font-bold">{currentPrice.toFixed(5)}</div>
                          <div className="text-xs text-slate-400">Tempo real</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400">Carregando indicadores para {currentAsset}...</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Trades Ativos */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Trades Ativos</CardTitle>
                <CardDescription>Posições abertas atualmente</CardDescription>
              </CardHeader>
              <CardContent>
                {activeTrades.length > 0 ? (
                  <div className="space-y-2">
                    {activeTrades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant={trade.direction === 'CALL' ? "default" : "destructive"}>
                            {trade.direction}
                          </Badge>
                          <span className="font-medium">{trade.asset}</span>
                          <span className="text-sm text-slate-400">${trade.amount}</span>
                        </div>
                        <div className="text-sm text-slate-400">
                          Expira: {new Date(trade.expiryTime).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">Nenhum trade ativo</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Análise */}
          <TabsContent value="analysis">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Análise de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{stats.winningTrades}</div>
                    <div className="text-sm text-slate-400">Trades Vencedores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400">{stats.losingTrades}</div>
                    <div className="text-sm text-slate-400">Trades Perdedores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{stats.totalTrades}</div>
                    <div className="text-sm text-slate-400">Total de Trades</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Demo - Apenas para modo demo */}
          {settings.isDemoMode && (
            <TabsContent value="demo" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sessão Atual */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5 text-blue-400" />
                      Sessão de Teste Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentSession ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Saldo Inicial</Label>
                            <div className="text-lg font-bold text-blue-400">
                              ${currentSession.initialBalance.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm">Saldo Atual</Label>
                            <div className="text-lg font-bold text-green-400">
                              ${balance.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm">Duração</Label>
                            <div className="text-lg font-bold">
                              {Math.floor((Date.now() - currentSession.startTime) / 60000)}min
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm">P&L</Label>
                            <div className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${stats.totalProfit.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={Math.max(0, Math.min(100, ((balance / currentSession.initialBalance) - 1) * 100 + 50))} 
                          className="h-2"
                        />
                        <div className="text-xs text-slate-400 text-center">
                          Performance: {(((balance / currentSession.initialBalance) - 1) * 100).toFixed(2)}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <TestTube className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-400 mb-4">Nenhuma sessão de teste ativa</p>
                        <Button onClick={startTestSession} disabled={!isConnected}>
                          Iniciar Nova Sessão
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Histórico de Sessões */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-purple-400" />
                      Histórico de Testes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testSessions.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {testSessions.slice(-5).reverse().map((session) => (
                          <div key={session.id} className="p-3 bg-slate-700/50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">
                                Sessão {new Date(session.startTime).toLocaleDateString()}
                              </span>
                              <Badge variant={session.finalBalance && session.finalBalance > session.initialBalance ? "default" : "destructive"}>
                                {session.finalBalance && ((session.finalBalance / session.initialBalance - 1) * 100).toFixed(1)}%
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                              <div>Trades: {session.totalTrades}</div>
                              <div>Win Rate: {session.winRate.toFixed(1)}%</div>
                              <div>Duração: {session.endTime ? Math.floor((session.endTime - session.startTime) / 60000) : 0}min</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-6">
                        Nenhuma sessão de teste concluída
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Alertas de Segurança para Demo */}
              <Alert className="bg-blue-900/20 border-blue-500/30">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Modo Demo Ativo:</strong> Você está testando com dinheiro virtual. 
                  Todos os trades são simulados e não afetam sua conta real. 
                  Use este modo para testar estratégias e configurações antes de usar dinheiro real.
                </AlertDescription>
              </Alert>
            </TabsContent>
          )}

          {/* Histórico de Trades */}
          <TabsContent value="trades">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Histórico de Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {historicalTrades.slice(-10).reverse().map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={trade.direction === 'CALL' ? "default" : "destructive"}>
                          {trade.direction}
                        </Badge>
                        <span className="font-medium">{trade.asset}</span>
                        <span className="text-sm text-slate-400">${trade.amount}</span>
                        {trade.result === 'WIN' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${trade.profit && trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.profit ? `$${trade.profit.toFixed(2)}` : '-'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(trade.entryTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações do Bot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Toggle Demo/Real */}
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Modo de Operação</Label>
                      <p className="text-sm text-slate-400 mt-1">
                        {settings.isDemoMode 
                          ? 'Modo Demo: Teste com dinheiro virtual sem riscos' 
                          : 'Conta Real: Operações com dinheiro real - CUIDADO!'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <Switch
                        checked={settings.isDemoMode}
                        onCheckedChange={toggleDemoMode}
                        disabled={isConnected || isRunning}
                      />
                      <TestTube className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Configurações Demo */}
                  {settings.isDemoMode && (
                    <div className="space-y-2">
                      <Label>Saldo Demo Inicial ($)</Label>
                      <Input
                        type="number"
                        value={settings.demoBalance}
                        onChange={(e) => setSettings(prev => ({ ...prev, demoBalance: Number(e.target.value) }))}
                        className="bg-slate-700/50 border-slate-600"
                        disabled={isConnected}
                      />
                      <p className="text-xs text-slate-400">Saldo virtual para testes</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Stop Loss (%)</Label>
                    <Input
                      type="number"
                      value={settings.stopLoss}
                      onChange={(e) => setSettings(prev => ({ ...prev, stopLoss: Number(e.target.value) }))}
                      className="bg-slate-700/50 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Stop Win (%)</Label>
                    <Input
                      type="number"
                      value={settings.stopWin}
                      onChange={(e) => setSettings(prev => ({ ...prev, stopWin: Number(e.target.value) }))}
                      className="bg-slate-700/50 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor da Entrada ($)</Label>
                    <Input
                      type="number"
                      value={settings.entryAmount}
                      onChange={(e) => setSettings(prev => ({ ...prev, entryAmount: Number(e.target.value) }))}
                      className="bg-slate-700/50 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Máximo de Trades/Dia</Label>
                    <Input
                      type="number"
                      value={settings.maxDailyTrades}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxDailyTrades: Number(e.target.value) }))}
                      className="bg-slate-700/50 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confiança Mínima ML (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.minConfidence * 100}
                      onChange={(e) => setSettings(prev => ({ ...prev, minConfidence: Number(e.target.value) / 100 }))}
                      className="bg-slate-700/50 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ativo Selecionado</Label>
                    <select 
                      value={currentAsset}
                      onChange={(e) => setCurrentAsset(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2"
                    >
                      {availableAssets.map(asset => (
                        <option key={asset} value={asset}>{asset}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400">Ativo principal para análises e trades automáticos</p>
                  </div>
                </div>

                {/* Alertas baseados no modo */}
                {settings.isDemoMode ? (
                  <Alert className="bg-blue-900/20 border-blue-500/30">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Modo Demo Ativo:</strong> {currentAsset} | 
                      Teste suas estratégias com segurança antes de usar dinheiro real. 
                      Saldo virtual: ${settings.demoBalance.toFixed(2)}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-red-900/20 border-red-500/30">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>⚠️ CONTA REAL ATIVA:</strong> {currentAsset} | 
                      Operações com dinheiro real! Certifique-se de ter testado todas as configurações em modo demo primeiro.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}