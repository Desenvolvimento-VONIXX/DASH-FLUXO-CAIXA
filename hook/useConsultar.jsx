import { useState, useEffect } from 'react';
import { usePostRequest } from './usePostRequest';

export const useConsultar = (queryText, dependencies = []) => {
  const { post } = usePostRequest();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const parseQueryResponse = (response) => {
    let parsedData = typeof response === 'string' ? JSON.parse(response) : response;
    
    parsedData = parsedData.data?.responseBody || parsedData.responseBody || {};
    const fields = parsedData.fieldsMetadata || [];
    const rows = parsedData.rows || [];

    return rows.map((row) => 
      fields.reduce((acc, field, i) => ({ ...acc, [field.name]: row[i] }), {})
    );
  };

  const fetchQuery = async () => {
    if (!queryText) return; // Verifica se a query é válida
    const formattedQuery = queryText.replace(/(\r\n|\n|\r)/gm, '');
    const url = `${window.location.origin}/mge/service.sbr?serviceName=DbExplorerSP.executeQuery&outputType=json`;
    const body = {
      serviceName: 'DbExplorerSP.executeQuery',
      requestBody: { sql: formattedQuery },
    };

    setLoading(true);
    try {
      const response = await post(url, body);
      const result = parseQueryResponse(response);
      setData(result);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erro ao consultar o banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuery();
  }, [queryText, ...dependencies]); // Executa quando a queryText ou dependências mudam

  return { data, loading, error };
};
