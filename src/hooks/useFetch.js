import { useEffect, useState } from 'react';

export function useFetch(fetchFn, path, initialValue) {
  const [data, setData] = useState(initialValue);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setIsFetching(true);
      try {
        const userPlaces = await fetchFn(path);
        setData(userPlaces);
      } catch (err) {
        setError({
          message: err.message || 'Failed to fetch data.',
        });
      }

      setIsFetching(false);
    }

    fetchData();
  }, [fetchFn, path]);

  return {
    data,
    isFetching,
    error,
    setData,
  };
}
