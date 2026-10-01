export interface ApiResponse<TData, TMeta = undefined> {
  data: TData;
  meta?: TMeta;
}

export interface GameSummary {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
}
