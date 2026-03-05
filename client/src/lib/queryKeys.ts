export const queryKeys = {
  products: {
    list: () => ['products', 'list'] as const,
    mine: () => ['products', 'mine'] as const,
    search: (params: Record<string, string>) => ['products', 'search', params] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  favorites: {
    list: () => ['favorites', 'list'] as const,
  },
  chat: {
    rooms: (userId: string) => ['chat', 'rooms', userId] as const,
    room: (roomId: string) => ['chat', 'room', roomId] as const,
  },
  geo: {
    districts: () => ['geo', 'districts'] as const,
  },
};
