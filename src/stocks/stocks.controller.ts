import { Controller, Get } from '@nestjs/common';
import { StocksService } from './stocks.service';

@Controller('stocks')
export class StocksController {
  constructor(private stocks: StocksService) {}

  @Get()
  getStocks() {
    const stocks = this.stocks.getStocks();
    return stocks;
  }
}
