export interface Client {
  id: string;
  name: string;
  mobile: string;
  isActive: boolean;
}

export interface ClientDropdownItem {
  id: string;
  name: string;
}

export interface CreateClientInput {
  name: string;
  mobile: string;
}

export interface UpdateClientInput {
  name?: string;
  mobile?: string;
  status?: boolean;
}
