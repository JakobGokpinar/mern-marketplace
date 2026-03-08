export const queryKeys = {
  products: {
    list: (page = 1) => ['products', 'list', page] as const,
    mine: () => ['products', 'mine'] as const,
    search: (paramsKey: string, page = 1) => ['products', 'search', paramsKey, page] as const,
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
