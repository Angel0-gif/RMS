export interface Category {
  id: number; name: string; description: string; icon: string;
  is_active: boolean; item_count: number; created_at: string;
}
export interface MenuItem {
  id: number; category: number; category_name: string; name: string;
  description: string; price: number; image?: string; image_url?: string;
  is_available: boolean; is_featured: boolean; preparation_time: number;
  calories?: number; allergens?: string; created_at: string; updated_at: string;
}
