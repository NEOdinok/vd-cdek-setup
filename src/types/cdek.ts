export type CdekSelectedDeliveryMode = "door" | "office";

export interface CdekSelectedAddress {
  address: string;
  allowed_cod: boolean;
  city: string;
  city_code: number;
  code: string;
  country_code: string;
  dimensions: [number, number, number] | null;
  have_cash: boolean;
  have_cashless: boolean;
  is_dressing_room: boolean;
  location: [number, number];
  name: string;
  postal_code: string;
  region: string;
  type: string;
  weight_max: number;
  weight_min: number;
  work_time: string;
}

export type CdekSelectedTariff = {
  tariff_code: number;
  tariff_name: string;
  tariff_description: string;
  delivery_mode: number;
  period_min: number;
  period_max: number;
  delivery_sum: number;
};
