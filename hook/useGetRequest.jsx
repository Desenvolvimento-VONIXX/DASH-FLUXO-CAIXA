import { useState, useCallback } from 'react';

export const useGetRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const get = useCallback(async (url, { headers = {}, raw = false } = {}) => {
    setLoading(true);
    let isJSON = true;

    if (headers) {
      const contentType = headers['Content-Type'] || 'application/json; charset=UTF-8';
      isJSON = /json/i.test(headers['Content-Type'] || contentType);
      headers['Content-Type'] = contentType;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        redirect: 'follow',
        credentials: 'include',
        mode: 'no-cors',
      });

      const result = raw ? response : isJSON ? await response.json() : await response.text();
      setLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return { get, loading, error };
};
