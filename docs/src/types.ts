// new trade info object
export interface TradeInfo {
  id: number;
  quantity: number;
  amount: number;
  isPurchase: boolean | null;
  isCash: boolean | null;
  date?: string;
  newName?: string;
}

// define item object including id, name, stock
export type Item = {
  id: number,
  name: string,
  stock: number,
}

// holding cash object varies for value
export type Cash = {
  [key in 10000 | 5000 | 1000 | 500 | 100 | 50 | 10 | 5 | 1]: number;
}
