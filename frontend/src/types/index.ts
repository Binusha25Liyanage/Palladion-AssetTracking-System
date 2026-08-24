export type Role = "ADMIN" | "DEPT_HEAD" | "EMPLOYEE";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  department: number | null;
  department_name: string;
  phone: string;
  is_active_employee: boolean;
  is_active: boolean;
  date_joined: string;
}

export type AssetStatus = "ACTIVE" | "IN_REPAIR" | "RETIRED" | "DISPOSED";

export interface Asset {
  id: number;
  asset_tag: string;
  name: string;
  category: number;
  category_name: string;
  status: AssetStatus;
  department: number | null;
  department_name: string;
  current_holder: number | null;
  current_holder_name: string;
  location: string;
  created_at: string;
  description?: string;
  serial_number?: string;
  purchase_date?: string | null;
  purchase_value?: string | null;
  useful_life_years?: number;
  book_value?: string | null;
}

export interface Department {
  id: number;
  name: string;
  head: number | null;
  head_name: string;
  created_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
