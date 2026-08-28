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

export interface AssetCategory {
  id: number;
  name: string;
  code: string;
}

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

export type MaintenanceStatus = "REPORTED" | "IN_PROGRESS" | "RESOLVED";

export interface MaintenanceLog {
  id: number;
  asset: number;
  asset_tag: string;
  reported_by: number;
  reported_by_name: string;
  issue_description: string;
  status: MaintenanceStatus;
  resolution_notes: string;
  invoice_image_url: string;
  reported_at: string;
  resolved_at: string | null;
}

export type AssignmentStatus = "ACTIVE" | "RETURNED";

export interface Assignment {
  id: number;
  asset: number;
  asset_tag: string;
  assigned_to: number;
  assigned_to_name: string;
  assigned_by: number | null;
  department: number | null;
  status: AssignmentStatus;
  notes: string;
  assigned_at: string;
  returned_at: string | null;
}

export interface Printer {
  id: number;
  name: string;
  printer_type: "A4" | "THERMAL";
  connection_info: string;
  is_default: boolean;
}

export interface ReportRow {
  [key: string]: string | number | null;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
