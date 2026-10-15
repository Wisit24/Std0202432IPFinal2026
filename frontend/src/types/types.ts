export interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number;
  isActive: boolean;
}

export interface KMeansTier {
  tierName: string;
  centroid: number;
  members: Employee[];
}