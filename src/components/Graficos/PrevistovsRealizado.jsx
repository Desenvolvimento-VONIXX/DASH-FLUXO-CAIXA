import React, { useEffect, useState } from "react";
import { useConsultar } from "../../../hook/useConsultar";
import { Line } from "react-chartjs-2";
import Snipper from "../Snipper";

import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);


function PrevistoRealizado({ dataInicial, dataFinal, banco, empresa }) {
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
            ),
            AReceber AS (
                SELECT 
                    DAY(CONVERT(DATE, FIN.DTVENC)) AS Dia,
                    SUM(VLRDESDOB) AS Contas_AReceber
                FROM SANKHYA.TGFFIN FIN
                WHERE 
                FIN.RECDESP = 1 
                AND FIN.PROVISAO = 'N' 
                AND FIN.ORIGEM IN ('E', 'F')
			    AND FIN.CODNAT NOT IN ('90100', '190100', '290100', '90200', '90201', '90202', '90203', '90204', '190200', '290200')
                AND CONVERT(DATE,FIN.DTVENC) BETWEEN '${dataInicial}' AND '${dataFinal}'
                ${banco ? `AND FIN.CODCTABCOINT = ${banco}` : ''}
                ${empresa ? `AND FIN.CODEMP = ${empresa}` : ''}
                AND (FIN.DHBAIXA IS NULL) 
                GROUP BY DAY(CONVERT(DATE, FIN.DTVENC))
            ),
            APagar AS (
                SELECT 
                    DAY(CONVERT(DATE, FIN.DTVENC)) AS Dia,
                    SUM(VLRDESDOB) AS Contas_APagar
                FROM SANKHYA.TGFFIN FIN
                WHERE 
                FIN.RECDESP = -1 
                AND FIN.PROVISAO IN('N','S') 
                AND (FIN.DHBAIXA IS NULL) 
                AND FIN.ORIGEM IN ('E', 'F')
			    AND FIN.CODNAT NOT IN ('90100', '190100', '290100', '90200', '90201', '90202', '90203', '90204', '190200', '290200')
                AND CONVERT(DATE,FIN.DTVENC) BETWEEN '${dataInicial}' AND '${dataFinal}'
                ${banco ? `AND FIN.CODCTABCOINT = ${banco}` : ''}
                ${empresa ? `AND FIN.CODEMP = ${empresa}` : ''}
                GROUP BY DAY(CONVERT(DATE, FIN.DTVENC))
            )

        SELECT 
            COALESCE(R.Dia, P.Dia, AR.Dia, AP.Dia) AS DIA,
            COALESCE(R.Contas_Recebidas, 0) - COALESCE(P.Contas_Pagas, 0) AS SALDO_REALIZADO,
            COALESCE(AR.Contas_AReceber, 0) - COALESCE(AP.Contas_APagar, 0) AS SALDO_PROJETADO
        FROM Recebidas R
        FULL OUTER JOIN Pagas P ON R.Dia = P.Dia
        FULL OUTER JOIN AReceber AR ON R.Dia = AR.Dia OR P.Dia = AR.Dia
        FULL OUTER JOIN APagar AP ON AR.Dia = AP.Dia OR R.Dia = AP.Dia OR P.Dia = AP.Dia
        ORDER BY Dia;
        `;
        setConsulta(novaConsulta);
    }, [dataInicial, dataFinal, banco, empresa]);

    const { data, loading, error } = useConsultar(consulta);
    useEffect(() => {
        if (data && data.length > 0) {
            const formattedData = data.map(item => ({
                dia: item.DIA,
                saldoRealizado: item.SALDO_REALIZADO,
                saldoProjetado: item.SALDO_PROJETADO,
            }));
            setResult(formattedData);
        }
    }, [data]);


    const chartData = {
        labels: result.map(item => `${item.dia}`),
        datasets: [
            {
                label: 'Saldo Projetado',
                data: result.map(item => item.saldoProjetado),
                borderColor: 'rgb(16, 45, 101)',
                backgroundColor: 'rgb(16, 45, 101)',
                fill: true,
            },
            {
                label: 'Saldo Realizado',
                data: result.map(item => item.saldoRealizado),
                borderColor: 'rgb(17, 141, 255)',
                backgroundColor: 'rgb(17, 141, 255)',
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                enabled: true,
            },
            datalabels: {
                display: false,
            },
        },
    };

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
        <div style={{ width: '100%', overflowX: 'auto', overflowY: 'auto' }}>
            <div>
                <Line data={chartData} options={options} style={{ height: '200px' }} />
            </div>
        </div>
    );
}

export default PrevistoRealizado;
