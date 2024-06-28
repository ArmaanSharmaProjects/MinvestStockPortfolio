import React, { useState, useEffect } from 'react';
import './StockList.css'

interface Stock {
  symbol: string;
  name: string;
  price: number;
  sector: string;
}

const API_KEY = 'cplujshr01qn8g1vcf4gcplujshr01qn8g1vcf50';
const DOW_30_SYMBOLS = ['AAPL', 'AMGN', 'AXP', 'BA', 'CAT', 'CRM', 'CSCO', 'CVX', 'DIS', 'DOW', 'GS', 'HD', 'HON', 'IBM', 'INTC', 'JNJ', 'JPM', 'KO', 'MCD', 'MMM', 'MRK', 'MSFT', 'NKE', 'PG', 'TRV', 'UNH', 'V', 'VZ', 'WBA', 'WMT'];

const StockList: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Stock[]>([]);

  useEffect(() => {
    const fetchStocks = async () => {
      const stocksData: Stock[] = [];

      for (const symbol of DOW_30_SYMBOLS) {
        try {
          const [quoteResponse, profileResponse] = await Promise.all([
            fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`),
            fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`)
          ]);

          const quoteData = await quoteResponse.json();
          const profileData = await profileResponse.json();

          stocksData.push({
            symbol: symbol,
            name: profileData.name,
            price: quoteData.c,
            sector: profileData.finnhubIndustry
          });
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
        }
      }

      setStocks(stocksData);
    };

    fetchStocks();
  }, []);

  const addToPortfolio = (stock: Stock) => {
    if (!portfolio.some(s => s.symbol === stock.symbol)) {
      setPortfolio([...portfolio, stock]);
    }
  };

  const removeFromPortfolio = (stock: Stock) => {
    setPortfolio(portfolio.filter(s => s.symbol !== stock.symbol));
  };

  const calculateDiversity = () => {
    const totalValue = portfolio.reduce((sum, stock) => sum + stock.price, 0);
    const sectorWeights: { [key: string]: number } = {};

    portfolio.forEach(stock => {
      const weight = stock.price / totalValue;
      sectorWeights[stock.sector] = (sectorWeights[stock.sector] || 0) + weight;
    });

    const squaredWeights = Object.values(sectorWeights).reduce((sum, weight) => sum + Math.pow(weight, 2), 0);
    const diversity = (1 - squaredWeights) * 100;

    return diversity.toFixed(2);
  };

  return (
    <div className="stock-portfolio-calculator">
      <div className="selected-stocks">
        <h2>Selected Stocks</h2>
        <div className="stock-grid">
          {portfolio.map((stock) => (
            <div key={stock.symbol} className="stock-card">
              <h3>{stock.name}</h3>
              <p>Symbol: {stock.symbol}</p>
              <p>Price: ${stock.price.toFixed(2)}</p>
              <p>Sector: {stock.sector}</p>
              <button onClick={() => removeFromPortfolio(stock)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="portfolio-diversity">
        <h2>Stock Portfolio Diversity</h2>
        <div className="diversity-score">
          <span>{calculateDiversity()}%</span>
        </div>
        <p>(Insert score from formula here)</p>
      </div>
      
      <div className="all-stocks">
        <h2>All Stocks</h2>
        <div className="stock-grid">
          {stocks.map((stock) => (
            <div key={stock.symbol} className="stock-card">
              <h3>{stock.name}</h3>
              <p>Symbol: {stock.symbol}</p>
              <p>Price: ${stock.price}</p>
              <p>Sector: {stock.sector}</p>
              <button onClick={() => addToPortfolio(stock)}>Add to Portfolio</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockList;