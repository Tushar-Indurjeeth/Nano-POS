export interface Product {
  id: number;
  sku: string;
  name: string;
  unit_price: number;
  color: string;
  sizing: string;
}

export interface CartItem extends Product {
  quantity: number;
}
