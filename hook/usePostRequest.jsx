import { useState, useCallback } from 'react';

export const usePostRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = useCallback(async (url, body, { headers = {}, raw = false } = {}) => {
    setLoading(true);
    let isJSON = true;

    if (headers) {
      const contentType = headers['Content-Type'] || 'application/json; charset=UTF-8';
      isJSON = /json/i.test(headers['Content-Type'] || contentType);
      headers['Content-Type'] = contentType;
    }

    try {
      const formattedBody = typeof body === 'object' ? JSON.stringify(body) : body;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formattedBody,
        redirect: 'follow',
        credentials: 'include',
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

  return { post, loading, error };
};
