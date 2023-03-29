import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class StocksService {
  constructor(private config: ConfigService) {}

  async getStocks() {
    const api_key = this.config.get('API_KEY');

    // const response = await axios.get(
    //   `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${api_key}`,
    // );
    // const stocks = response.data;
    // return stocks;

    const endpoint = `https://www.alphavantage.co/query?function=MARKET_STATUS&apikey=${api_key}`;

    const stocks = axios
      .get(endpoint)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });

    return stocks;
  }
}
