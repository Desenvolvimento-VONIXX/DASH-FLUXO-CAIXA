import React, { useEffect, useState } from "react";
import { useConsultar } from "../../../hook/useConsultar";
import { GoTriangleUp, GoTriangleDown } from "react-icons/go";
import Snipper from "../Snipper";

function TableRecebidoPagoRealizado({ dataInicial, dataFinal, banco, empresa }) {
  const [result, setResult] = useState([]);
  const [consulta, setConsulta] = useState('');

  useEffect(() => {
    const novaConsulta = `
       WITH Recebidas AS (
        SELECT  
          DAY(CONVERT(DATE, FIN.DHBAIXA)) AS Dia,
          SUM(VLRBAIXA) AS Contas_Recebidas
        FROM SANKHYA.TGFFIN FIN
        WHERE 
          FIN.RECDESP IN(1)  
          AND FIN.PROVISAO = 'N' 
          AND CONVERT(DATE,FIN.DHBAIXA) BETWEEN '${dataInicial}' AND '${dataFinal}'
          ${banco ? `AND FIN.CODCTABCOINT = ${banco}` : ''}
          ${empresa ? `AND FIN.CODEMP = ${empresa}` : ''}
          AND  NOT (FIN.PROVISAO = 'S' AND FIN.DHBAIXA IS NOT NULL AND FIN.ORIGEM = 'E')
          AND  FIN.NUBCO IS NOT NULL
        GROUP BY DAY(CONVERT(DATE, FIN.DHBAIXA)) 
      ),
      Pagas AS (
        SELECT 
          DAY(CONVERT(DATE, FIN.DHBAIXA)) AS Dia,
          SUM(VLRBAIXA) AS Contas_Pagas
        FROM SANKHYA.TGFFIN FIN
        WHERE 
          FIN.RECDESP = -1  
          AND FIN.PROVISAO IN('N','S') 
          AND FIN.DHBAIXA IS NOT NULL 
          AND CONVERT(DATE,FIN.DHBAIXA) BETWEEN '${dataInicial}' AND '${dataFinal}'
          ${banco ? `AND FIN.CODCTABCOINT = ${banco}` : ''}
          ${empresa ? `AND FIN.CODEMP = ${empresa}` : ''}
          AND  NOT (FIN.PROVISAO = 'S' AND FIN.DHBAIXA IS NOT NULL AND FIN.ORIGEM = 'E')
          AND  FIN.NUBCO IS NOT NULL
        GROUP BY DAY(CONVERT(DATE, FIN.DHBAIXA))
      )

      SELECT 
        COALESCE(R.Dia, P.Dia) AS DIA,
        COALESCE(R.Contas_Recebidas, 0) AS TOTAL_RECEBIDAS,
        COALESCE(P.Contas_Pagas, 0) AS TOTAL_PAGAS,
        COALESCE(R.Contas_Recebidas, 0) - COALESCE(P.Contas_Pagas, 0) AS SALDO_PREVISTO
      FROM Recebidas R
      FULL OUTER JOIN Pagas P ON R.Dia = P.Dia
      ORDER BY DIA;
    `;
    setConsulta(novaConsulta);
  }, [dataInicial, dataFinal, banco, empresa]);

  const { data, loading, error } = useConsultar(consulta);

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map(item => ({
        dia: item.DIA,
        totalRecebida: item.TOTAL_RECEBIDAS,
        totalPaga: item.TOTAL_PAGAS,
        saldoRealizado: item.SALDO_PREVISTO,
      }));
      setResult(formattedData);
    }
  }, [data]);

  // Calcular totais
  const totalReceber = result.reduce((acc, item) => acc + item.totalRecebida, 0);
  const totalPagar = result.reduce((acc, item) => acc + item.totalPaga, 0);
  const totalSaldo = result.reduce((acc, item) => acc + item.saldoRealizado, 0);

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
      <div className="relative overflow-auto shadow-md sm:rounded-lg h-full">
        <table className="w-full text-[13px] text-left rtl:text-right text-gray-500">
          <thead className="text-[10px] text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-2 py-1">Dia</th>
              <th scope="col" className="px-2 py-1 text-right">Total Recebido</th>
              <th scope="col" className="px-2 py-1 text-right">Total Pago</th>
              <th scope="col" className="px-2 py-1 text-right">Saldo Realizado</th>
            </tr>
          </thead>
          <tbody>
            {result.map((item, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="px-2 py-1 font-medium text-gray-900 whitespace-nowrap">{item.dia}</th>
                <td className="px-2 py-1 text-right">
                  {item.totalRecebida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 py-1 text-right">
                  {item.totalPaga.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 py-1 flex items-center justify-end">
                  <span style={{ color: item.saldoRealizado < 0 ? 'red' : 'green', marginRight: '5px' }}>
                    {item.saldoRealizado < 0 ? <GoTriangleDown /> : <GoTriangleUp />}
                  </span>
                  {item.saldoRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="text-[10px] text-gray-700 uppercase bg-gray-50">
            <tr className="bg-white border-b hover:bg-gray-50">
              <th scope="row" className="px-2 py-1 font-medium text-gray-900 whitespace-nowrap">Total</th>
              <td className="px-2 py-1 text-right">
                {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-2 py-1 text-right">
                {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-2 py-1 text-right">
                {totalSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

export default TableRecebidoPagoRealizado;
