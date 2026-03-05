export const queryKeys = {
  products: {
    list: (page = 1) => ['products', 'list', page] as const,
    mine: () => ['products', 'mine'] as const,
    search: (params: Record<string, string>, page = 1) => ['products', 'search', params, page] as const,
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
