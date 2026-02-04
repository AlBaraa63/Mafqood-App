export interface ItemFormData {
  image: File | null;
  imagePreview?: string;
  where: string;
  specificPlace?: string;
  when: string;
  description?: string;
}

export interface Item {
  id: string;
  type: 'lost' | 'found';
  imageUrl: string;
  where: string;
  specificPlace?: string;
  when: string;
  description: string;
  timestamp: Date;
}

export interface Match {
  id: string;
  item: Item;
  similarity: number;
  status: 'possible' | 'high' | 'exact';
}

export interface UserActivity {
  lostItems: Item[];
  foundItems: Item[];
  matches: Record<string, Match[]>;
}
