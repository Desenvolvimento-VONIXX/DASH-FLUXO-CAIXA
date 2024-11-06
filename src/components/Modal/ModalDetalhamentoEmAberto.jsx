import { useState, useEffect } from "react";
import { useConsultar } from "../../../hook/useConsultar";
import Snipper from "../Snipper";
import { valueOrDefault } from "chart.js/helpers";

function ModalDetalhamentoEmAberto({ dados, onClose }) {
    const { dataInicial, dataFinal, banco, empresa, tipo, mes } = dados;
    const [result, setResult] = useState([]);
    const [consulta, setConsulta] = useState('');

    const meses = {
        'Jan': 1,
        'Fev': 2,
        'Mar': 3,
        'Abr': 4,
        'Maio': 5,
        'Jun': 6,
        'Jul': 7,
        'Ago': 8,
        'Set': 9,
        'Out': 10,
        'Nov': 11,
        'Dez': 12
    };

    const numeroMes = meses[mes] || mes;

    const obterAno = (data) => {
        const dateObj = new Date(data);
        return dateObj.getFullYear();
    };

    const anoInicial = obterAno(dataInicial);
    const anoFinal = obterAno(dataFinal);

    useEffect(() => {
        let novaConsulta;
        if (tipo === 'Total A Receber') {
            novaConsulta = `
                SELECT DISTINCT
                FIN.NUFIN AS NRO_UNICO,
                FIN.NUMNOTA AS NUMNOTA,
                EMP.NOMEFANTASIA AS NOME_EMPRESA,
                CONVERT(VARCHAR(10), FIN.DTNEG, 103) AS DATA_NEG,
                CONVERT(VARCHAR(10), FIN.DTVENC, 103) AS DATA_VENCIMENTO,
                CONVERT(VARCHAR(10), FIN.DHBAIXA, 103) AS DATA_BAIXA,
                PAR.NOMEPARC AS NOME_PARCEIRO,
                CTA.DESCRICAO AS BANCO,
                NAT.DESCRNAT AS NATUREZA,
                TOPER.DESCROPER AS TIPO_OPERACAO,
                FIN.VLRDESDOB AS VLRDESDOB
                FROM SANKHYA.TGFFIN FIN
                INNER JOIN SANKHYA.TSIEMP EMP ON EMP.CODEMP = FIN.CODEMP
                INNER JOIN SANKHYA.TGFPAR PAR ON PAR.CODPARC = FIN.CODPARC
                INNER JOIN SANKHYA.TSICTA CTA ON FIN.CODCTABCOINT = CTA.CODCTABCOINT
                INNER JOIN SANKHYA.TGFNAT NAT ON FIN.CODNAT = NAT.CODNAT
                INNER JOIN SANKHYA.TGFTOP TOPER ON TOPER.CODTIPOPER = FIN.CODTIPOPER

                WHERE 
                FIN.RECDESP = 1 
                AND (FIN.DHBAIXA IS NULL) 
                AND FIN.PROVISAO = 'N'  
                AND FIN.ORIGEM IN ('E', 'F')
			    AND FIN.CODNAT NOT IN ('90100', '190100', '290100', '90200', '90201', '90202', '90203', '90204', '190200', '290200')
                AND YEAR(CONVERT(DATE, FIN.DTVENC)) BETWEEN '${anoInicial}' AND '${anoFinal}' 
                AND MONTH(CONVERT(DATE, FIN.DTVENC)) = ${numeroMes}
                ${banco ? `AND FIN.CODCTABCOINT = ${banco}` : ''}
                ${empresa ? `AND FIN.CODEMP = ${empresa}` : ''}

          
            `;
        } else if (tipo === "Total A Pagar") {
            novaConsulta = `
                SELECT DISTINCT
                FIN.NUFIN AS NRO_UNICO,
                FIN.NUMNOTA AS NUMNOTA,
                EMP.NOMEFANTASIA AS NOME_EMPRESA,
                CONVERT(VARCHAR(10), FIN.DTNEG, 103) AS DATA_NEG,
                CONVERT(VARCHAR(10), FIN.DTVENC, 103) AS DATA_VENCIMENTO,
                CONVERT(VARCHAR(10), FIN.DHBAIXA, 103) AS DATA_BAIXA,
                PAR.NOMEPARC AS NOME_PARCEIRO,
                CTA.DESCRICAO AS BANCO,
                NAT.DESCRNAT AS NATUREZA,
                TOPER.DESCROPER AS TIPO_OPERACAO,
                FIN.VLRDESDOB AS VLRDESDOB
                FROM SANKHYA.TGFFIN FIN
                INNER JOIN SANKHYA.TSIEMP EMP ON EMP.CODEMP = FIN.CODEMP
                INNER JOIN SANKHYA.TGFPAR PAR ON PAR.CODPARC = FIN.CODPARC
                INNER JOIN SANKHYA.TSICTA CTA ON FIN.CODCTABCOINT = CTA.CODCTABCOINT
                INNER JOIN SANKHYA.TGFNAT NAT ON FIN.CODNAT = NAT.CODNAT
                INNER JOIN SANKHYA.TGFTOP TOPER ON TOPER.CODTIPOPER = FIN.CODTIPOPER
                WHERE 
                FIN.RECDESP = -1 
                AND FIN.PROVISAO IN('N','S') 
                AND (FIN.DHBAIXA IS NULL) 
                AND FIN.ORIGEM IN ('E', 'F')
			    AND FIN.CODNAT NOT IN ('90100', '190100', '290100', '90200', '90201', '90202', '90203', '90204', '190200', '290200')
                AND YEAR(CONVERT(DATE, FIN.DTVENC)) BETWEEN '${anoInicial}' AND '${anoFinal}' 
                AND MONTH(CONVERT(DATE, FIN.DTVENC)) = ${numeroMes}
                ${banco ? `AND FIN.CODCTABCOINT = ${banco}` : ''}
                ${empresa ? `AND FIN.CODEMP = ${empresa}` : ''}
            
            `;
        }

        setConsulta(novaConsulta);
    }, [anoInicial, anoFinal, numeroMes, banco, empresa, tipo]);

    const { data, loading, error } = useConsultar(consulta);
    console.log(consulta)

    useEffect(() => {
        if (data && data.length > 0) {
            const formattedData = data.map(item => ({
                nroUnico: item.NRO_UNICO,
                numNota: item.NUMNOTA,
                nomeEmpresa: item.NOME_EMPRESA,
                dataVencimento: item.DATA_VENCIMENTO,
                dataNegociacao: item.DATA_NEG,
                dataBaixa: item.DATA_BAIXA,
                nomeParceiro: item.NOME_PARCEIRO,
                banco: item.BANCO,
                natureza: item.NATUREZA,
                tipoOperacao: item.TIPO_OPERACAO,
                valor: item.VLRDESDOB
            }));
            setResult(formattedData);
        }
    }, [data]);

    // Calcular totais
    const total = result.reduce((acc, item) => acc + item.valor, 0);

    // Estados de filtro para cada coluna
    const [filters, setFilters] = useState({
        nroUnico: '', numNota: '', nomeEmpresa: '', dataVencimento: '',
        dataNegociacao: '', dataBaixa: '', nomeParceiro: '', banco: '',
        natureza: '', tipoOperacao: '', valor: ''
    });

    // Função para lidar com a mudança no filtro
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value.trim() });
    };

    const filteredResult = result.filter(item =>
        Object.keys(filters).every(key =>
            filters[key] === '' || item[key]?.toString().toLowerCase().includes(filters[key].toLowerCase().trim())
        )
    );

    if (error) {
        return (
            <div className="flex justify-center items-center">
                Error: {error.message}
            </div>
        );

    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
            <div className="relative w-full h-full p-4">
                <div className="relative w-full h-full bg-white rounded-lg shadow dark:bg-gray-700 overflow-auto">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Detalhes do {tipo}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg w-8 h-8">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 md:p-5">
                        <div className="overflow-auto shadow-md sm:rounded-lg max-h-[70vh]">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">

                                    <tr>
                                        <th className="px-6 py-3">Nro Único</th>
                                        <th className="px-6 py-3">Número Nota</th>
                                        <th className="px-6 py-3">Nome Empresa</th>
                                        <th className="px-6 py-3">Data Vencimento</th>
                                        <th className="px-6 py-3">Data Negociação</th>
                                        <th className="px-6 py-3">Data Baixa</th>
                                        <th className="px-6 py-3">Nome Parceiro</th>
                                        <th className="px-6 py-3">Banco</th>
                                        <th className="px-6 py-3">Natureza</th>
                                        <th className="px-6 py-3">Tipo Operação</th>
                                        <th className="px-6 py-3">Valor</th>
                                    </tr>

                                    <tr>
                                        {Object.keys(filters).map(key => (
                                            <th key={key} className="px-6 py-3">
                                                <input
                                                    type="text"
                                                    placeholder={`Filtrar ${key}`}
                                                    name={key}
                                                    value={filters[key].trim()}
                                                    onChange={handleFilterChange}
                                                
                                                    className="w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-600"
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="10">
                                                <div className="m-[15px] flex justify-center items-center">
                                                    <Snipper />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredResult.map((item, index) => (
                                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-2 py-1">{item.nroUnico}</td>
                                                <td className="px-2 py-1">{item.numNota}</td>
                                                <td className="px-2 py-1">{item.nomeEmpresa}</td>
                                                <td className="px-2 py-1">{item.dataVencimento}</td>
                                                <td className="px-2 py-1">{item.dataNegociacao}</td>
                                                <td className="px-2 py-1">{item.dataBaixa}</td>
                                                <td className="px-2 py-1">{item.nomeParceiro}</td>
                                                <td className="px-2 py-1">{item.banco}</td>
                                                <td className="px-2 py-1">{item.natureza}</td>
                                                <td className="px-2 py-1">{item.tipoOperacao}</td>
                                                <td className="px-2 py-1">{item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                            </tr>
                                        ))
                                    )} 
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex items-center p-4 md:p-5 border-t dark:border-gray-600">
                        <button onClick={onClose} className="text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-5 py-2.5">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalDetalhamentoEmAberto;
