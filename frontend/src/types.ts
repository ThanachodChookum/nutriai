export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  imageUrl?: string;
}

export interface UserStats {
  caloriesConsumed: number;
  calorieGoal: number;
  proteinConsumed: number;
  proteinGoal: number;
  carbsConsumed: number;
  carbsGoal: number;
  fatConsumed: number;
  fatGoal: number;
  waterConsumed: number;
  waterGoal: number;
  steps: number;
  stepGoal: number;
}
export interface AddMealModalProps {
  userId: string;
  onClose: () => void;
  onAdded: () => void;
  selectedDate: Date;
}