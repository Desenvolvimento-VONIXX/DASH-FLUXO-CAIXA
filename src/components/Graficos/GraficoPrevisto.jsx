import React, { useEffect, useState } from "react";
import { useConsultar } from "../../../hook/useConsultar";
import Snipper from "../Snipper";
import ModalDetalhamentoEmAberto from "../Modal/ModalDetalhamentoEmAberto";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

function GraficoPrevisto({ dataInicial, dataFinal, banco, empresa }) {
    const [result, setResult] = useState([]);
    const [consulta, setConsulta] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);

    useEffect(() => {
        const novaConsulta = `
            WITH Meses AS (
            SELECT 1 AS Mes, 'Jan' AS Nome
            UNION ALL SELECT 2, 'Fev'
            UNION ALL SELECT 3, 'Mar'
            UNION ALL SELECT 4, 'Abr'
            UNION ALL SELECT 5, 'Maio'
            UNION ALL SELECT 6, 'Jun'
            UNION ALL SELECT 7, 'Jul'
            UNION ALL SELECT 8, 'Ago'
            UNION ALL SELECT 9, 'Set'
            UNION ALL SELECT 10, 'Out'
            UNION ALL SELECT 11, 'Nov'
            UNION ALL SELECT 12, 'Dez'
            ),
             MesesFiltrados AS (
            SELECT 
                Mes,
                Nome
            FROM 
                Meses
            WHERE 
                Mes BETWEEN DATEPART(MONTH, '${dataInicial}') AND DATEPART(MONTH, '${dataFinal}')
        )
            SELECT 
                M.Nome AS MES,
                ISNULL(R.CONTAS_A_RECEBER, 0) AS CONTAS_A_RECEBER, 
                COALESCE(P.CONTAS_A_PAGAR, 0) AS CONTAS_A_PAGAR
            FROM 
				MesesFiltrados M
            LEFT JOIN (
                SELECT 
                    MONTH(FIN.DTVENC) AS Mes,
                    SUM(FIN.VLRDESDOB) AS CONTAS_A_RECEBER
                FROM 
                    SANKHYA.TGFFIN FIN
                WHERE 
                    FIN.RECDESP = 1 
                    AND (FIN.DHBAIXA IS NULL) 
                    AND FIN.PROVISAO = 'N' 
                    AND FIN.ORIGEM IN ('E', 'F')
			        AND FIN.CODNAT NOT IN ('90100', '190100', '290100', '90200', '90201', '90202', '90203', '90204', '190200', '290200')
					AND CONVERT(DATE, FIN.DTVENC) BETWEEN '${dataInicial}' AND '${dataFinal}'
                     ${banco ? `AND FIN.CODCTABCOINT = ${banco}` : ''}
                      ${empresa ? `AND FIN.CODEMP = ${empresa}` : ''}

                GROUP BY 
                    MONTH(FIN.DTVENC)
            ) AS R ON M.Mes = R.Mes
            LEFT JOIN (
                SELECT 
                    MONTH(FIN.DTVENC) AS Mes,
                    SUM(FIN.VLRDESDOB) AS CONTAS_A_PAGAR
                FROM 
                    SANKHYA.TGFFIN FIN
                WHERE 
                    FIN.RECDESP = -1 
                    AND FIN.PROVISAO IN('N','S') 
                    AND (FIN.DHBAIXA IS NULL) 
                    AND FIN.ORIGEM IN ('E', 'F')
			        AND FIN.CODNAT NOT IN ('90100', '190100', '290100', '90200', '90201', '90202', '90203', '90204', '190200', '290200')
					AND CONVERT(DATE, FIN.DTVENC) BETWEEN '${dataInicial}' AND '${dataFinal}'
                     ${banco ? `AND FIN.CODCTABCOINT = ${banco}` : ''}
                     ${empresa ? `AND FIN.CODEMP = ${empresa}` : ''}

                GROUP BY 
                    MONTH(FIN.DTVENC)
            ) AS P ON M.Mes = P.Mes
        ORDER BY 
            M.Mes;
        `;
        setConsulta(novaConsulta);
    }, [dataInicial, dataFinal, banco, empresa]);

    const { data, loading, error } = useConsultar(consulta);

    useEffect(() => {
        if (data && data.length > 0) {
            const formattedData = data.map(item => ({
                mes: item.MES,
                contasReceber: item.CONTAS_A_RECEBER,
                contasPagar: item.CONTAS_A_PAGAR,
            }));
            setResult(formattedData);
        }
    }, [data]);

    const chartData = {
        labels: result.map(item => item.mes),
        datasets: [
            {
                label: 'Contas a Receber',
                data: result.map(item => item.contasReceber),
                borderColor: 'rgb(16, 45, 101)',
                backgroundColor: 'rgb(16, 45, 101)',
                borderWidth: 1,
            },
            {
                label: 'Contas a Pagar',
                data: result.map(item => item.contasPagar),
                borderColor: 'rgb(17, 141, 255)',
                backgroundColor: 'rgb(17, 141, 255)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: 'Comparação de Contas Recebidas e Pagas',
            },
            datalabels: {
                color: 'black',
                anchor: 'center',
                align: 'center',
                backgroundColor: 'white',
                borderRadius: 3,
                padding: 1,
                formatter: (value) => {
                    return new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(value);
                },
                font: {
                    size: 8,
                    weight: 'bold',
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return `R$ ${value}`;
                    }
                }
            }
        },
        onClick: (e, elements) => {
            if (elements.length > 0) {
                const chart = elements[0];
                const datasetIndex = chart.datasetIndex;
                const index = chart.index;

                // Determina se foi "Total Recebido" ou "Total Pago"
                const tipo = datasetIndex === 0 ? 'Total A Receber' : 'Total A Pagar';
                const mes = result[index].mes;

                // Dados a serem passados ao modal
                const modalData = {
                    dataInicial,
                    dataFinal,
                    banco,
                    empresa,
                    mes,
                    tipo
                };

                // Abre o modal com os dados
                setModalData(modalData);
                setShowModal(true);
            }
        },

    };


    return (
        <div style={{ width: '100%', overflowX: 'auto', overflowY: 'auto' }}>
            <div>
                <Bar data={chartData} options={options} style={{ height: '200px' }} />
            </div>
            {showModal && (
                <ModalDetalhamentoEmAberto
                    dados={modalData}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

export default GraficoPrevisto;
