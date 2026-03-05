import axios from 'axios';

const serverURL = import.meta.env.VITE_API_URL || 'http://localhost:3080';

const instanceAxs = axios.create({
  baseURL: serverURL,
  withCredentials: true,
});

// 401 interceptor — dispatches to store via deferred import to avoid circular dependency
instanceAxs.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Dynamically import to avoid circular dependency at module load time
      const [{ default: store }, { userActions }, { uiSliceActions }] = await Promise.all([
        import('../store/index'),
        import('../store/userSlice'),
        import('../store/uiSlice'),
      ]);
      store.dispatch(userActions.logout());
      store.dispatch(
        uiSliceActions.setFeedbackBanner({
          severity: 'error',
          msg: 'Sesjonen din har utløpt. Logg inn på nytt.',
        })
      );
    }
    return Promise.reject(error);
  }
);

export { instanceAxs };
