import React, { useEffect, useState } from "react";
import { useConsultar } from "../../../hook/useConsultar";
import { GoTriangleUp } from "react-icons/go";
import Snipper from "../Snipper";

function TableDetalhamento({ dataInicial, dataFinal, banco, empresa }) {
  const [result, setResult] = useState([]);
  const [consulta, setConsulta] = useState('');

  useEffect(() => {
    const novaConsulta = `
          WITH Receber AS (
        SELECT 
            DAY(CONVERT(DATE, FIN.DTVENC)) AS Dia,
            SUM(VLRDESDOB) AS Contas_A_Receber
        FROM SANKHYA.TGFFIN FIN 
        WHERE 
            FIN.RECDESP = 1   
            AND FIN.PROVISAO = 'N' 
            AND CONVERT(DATE, FIN.DTVENC) BETWEEN '${dataInicial}' AND '${dataFinal}'
            AND FIN.ORIGEM IN ('E', 'F')
			      AND FIN.CODNAT NOT IN ('90100', '190100', '290100', '90200', '90201', '90202', '90203', '90204', '190200', '290200')
            AND (FIN.DHBAIXA IS NULL)
			${banco ? `AND FIN.CODCTABCOINT = ${banco}` : ''}
            ${empresa ? `AND FIN.CODEMP = ${empresa}` : ''}
        GROUP BY DAY(CONVERT(DATE, FIN.DTVENC))
    ),
    Pagar AS (
        SELECT 
            DAY(CONVERT(DATE, FIN.DTVENC)) AS Dia,
            SUM(VLRDESDOB) AS Contas_A_Pagar
        FROM SANKHYA.TGFFIN FIN
        WHERE 
            FIN.RECDESP = -1 
            AND FIN.PROVISAO IN ('N', 'S') 
            AND (FIN.DHBAIXA IS NULL) 
            AND FIN.ORIGEM IN ('E', 'F')
            AND FIN.CODNAT NOT IN ('90100', '190100', '290100', '90200', '90201', '90202', '90203', '90204', '190200', '290200')
            AND CONVERT(DATE, FIN.DTVENC) BETWEEN '${dataInicial}' AND '${dataFinal}'
            ${banco ? `AND FIN.CODCTABCOINT = ${banco}` : ''}
            ${empresa ? `AND FIN.CODEMP = ${empresa}` : ''}
		
        GROUP BY DAY(CONVERT(DATE, FIN.DTVENC))
    )

    SELECT 
        COALESCE(R.Dia, P.Dia) AS DIA,
        COALESCE(R.Contas_A_Receber, 0) AS TOTAL_RECEBER,
        COALESCE(P.Contas_A_Pagar, 0) AS TOTAL_PAGAR,
        COALESCE(R.Contas_A_Receber, 0) - COALESCE(P.Contas_A_Pagar, 0) AS SALDO_PREVISTO
    FROM Receber R
    FULL OUTER JOIN Pagar P ON R.Dia = P.Dia
    ORDER BY DIA;

    `;
    setConsulta(novaConsulta);
  }, [dataInicial, dataFinal, banco, empresa]);

  const { data, loading, error } = useConsultar(consulta);

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map(item => ({
        dia: item.DIA,
        totalReceber: item.TOTAL_RECEBER,
        totalPagar: item.TOTAL_PAGAR,
        saldoPrevisto: item.SALDO_PREVISTO,
      }));
      setResult(formattedData);
    }
  }, [data]);

  const totalAReceber = result.reduce((acc, item) => acc + item.totalReceber, 0);
  const totalAPagar = result.reduce((acc, item) => acc + item.totalPagar, 0);
  const totalPrevisto = result.reduce((acc, item) => acc + item.saldoPrevisto, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <Snipper />
      </div>
    );
  }


  if (error) {
    return (
      <div className="flex justify-center items-center">
        Error: {error.message}
      </div>
    );

  }
  return (
    <>
      <div className="relative overflow-auto shadow-md sm:rounded-lg h-full ">
        <table className="w-full text-[13px] text-left rtl:text-right text-gray-500">
          <thead className="text-[10px] text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-2 py-1">Dia</th>
              <th scope="col" className="px-2 py-1">Total A Receber</th>
              <th scope="col" className="px-2 py-1">Total A Pagar</th>
              <th scope="col" className="px-2 py-1">Saldo Projetado</th>
            </tr>
          </thead>
          <tbody>
            {result.map((item, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="px-2 py-1 font-medium text-gray-900 whitespace-nowrap">{item.dia}</th>
                <td className="px-2 py-1 text-right">
                  {item.totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 py-1 text-right">
                  {item.totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 py-1 flex items-center justify-end">
                  <span style={{ color: item.saldoPrevisto < 0 ? 'red' : 'green', marginRight: '5px' }}>
                    <GoTriangleUp />
                  </span>
                  {item.saldoPrevisto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

                </td>

              </tr>
            ))}
          </tbody>
          <tfoot className="text-[10px] text-gray-700 uppercase bg-gray-50">
            <tr className="bg-white border-b hover:bg-gray-50">
              <th scope="row" className="px-2 py-1 font-medium text-gray-900 whitespace-nowrap">Total</th>
              <td className="px-2 py-1 text-right">
                {totalAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-2 py-1 text-right">
                {totalAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-2 py-1 text-right">
                {totalPrevisto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </>
  );
}

export default TableDetalhamento;
