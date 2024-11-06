import { useState } from 'react';
import { usePostRequest } from './usePostRequest';

export const useSalvar = () => {
  const { post } = usePostRequest();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saveRecord = async (data, instance, primaryKeys) => {
    const url = `${window.location.origin}/mge/service.sbr?serviceName=CRUDServiceProvider.saveRecord&outputType=json`;
    const formattedData = formatData(data, instance, primaryKeys);

    setLoading(true);
    try {
      const result = await post(url, formattedData);
      setResponse(result);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar o registro.");
    } finally {
      setLoading(false);
    }
  };

  const formatData = (data, instance, primaryKeys) => {
    const localFields = Object.keys(data).reduce(
      (acc, key) => ({
        ...acc,
        [key.toUpperCase()]: { $: String(data[key]) },
      }),
      {}
    );

    const entity = {
      fieldset: {
        list: Object.keys(data).map((key) => key.toUpperCase()).join(','),
      },
    };

    const dataRow = primaryKeys
      ? { localFields, key: formatPrimaryKeys(primaryKeys) }
      : { localFields };

    return {
      serviceName: 'CRUDServiceProvider.saveRecord',
      requestBody: { dataSet: { rootEntity: instance, dataRow, entity, includePresentationFields: 'N' } },
    };
  };

  const formatPrimaryKeys = (keys) =>
    Object.keys(keys).reduce(
      (acc, key) => ({
        ...acc,
        [key.toUpperCase()]: { $: String(keys[key]) },
      }),
      {}
    );

  return { saveRecord, response, loading, error };
};
