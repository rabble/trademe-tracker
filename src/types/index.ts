// Basic types for the application

export interface User {
  id: string;
  email: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  status: 'active' | 'under_offer' | 'sold';
}
