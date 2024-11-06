import { useState, useEffect } from "react";
import { useConsultar } from "../../../hook/useConsultar";
import Snipper from "../Snipper";

function ModalDetalhamentoRealizado({ dados, onClose }) {
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
        if (tipo === 'Total Recebido') {
            novaConsulta = `
                SELECT DISTINCT
                FIN.NUFIN AS NRO_UNICO,
                FIN.NUMNOTA AS NUMNOTA,
                EMP.NOMEFANTASIA AS NOME_EMPRESA,
                CONVERT(VARCHAR(10), FIN.DTNEG, 103) AS DATA_NEG,
                CONVERT(VARCHAR(10), FIN.DHBAIXA, 103) AS DATA_BAIXA,
                PAR.NOMEPARC AS NOME_PARCEIRO,
                CTA.DESCRICAO AS BANCO,
                NAT.DESCRNAT AS NATUREZA,
                FIN.CODTIPOPER AS TIPO_OPERACAO,
                FIN.VLRBAIXA AS VLRBAIXA
                FROM SANKHYA.TGFFIN FIN
                INNER JOIN SANKHYA.TSIEMP EMP ON EMP.CODEMP = FIN.CODEMP
                INNER JOIN SANKHYA.TGFPAR PAR ON PAR.CODPARC = FIN.CODPARC
                INNER JOIN SANKHYA.TSICTA CTA ON FIN.CODCTABCOINT = CTA.CODCTABCOINT
                INNER JOIN SANKHYA.TGFNAT NAT ON FIN.CODNAT = NAT.CODNAT

                WHERE 
                FIN.RECDESP IN(1)  
                AND FIN.PROVISAO = 'N' 
                AND FIN.DHBAIXA IS NOT NULL 
                AND YEAR(CONVERT(DATE, FIN.DHBAIXA)) BETWEEN '${anoInicial}' AND '${anoFinal}' 
                AND MONTH(CONVERT(DATE, FIN.DHBAIXA)) = ${numeroMes}
                ${banco ? `AND FIN.CODCTABCOINT = ${banco}` : ''}
                ${empresa ? `AND FIN.CODEMP = ${empresa}` : ''}
                AND NOT (FIN.PROVISAO = 'S' AND FIN.DHBAIXA IS NOT NULL AND FIN.ORIGEM = 'E')
                AND FIN.NUBCO IS NOT NULL
   
            `;
        } else if (tipo === "Total Pago") {
            novaConsulta = `
                SELECT DISTINCT
                FIN.NUFIN AS NRO_UNICO,
                FIN.NUMNOTA AS NUMNOTA,
                EMP.NOMEFANTASIA AS NOME_EMPRESA,
                CONVERT(VARCHAR(10), FIN.DTNEG, 103) AS DATA_NEG,
                CONVERT(VARCHAR(10), FIN.DHBAIXA, 103) AS DATA_BAIXA,
                PAR.NOMEPARC AS NOME_PARCEIRO,
                CTA.DESCRICAO AS BANCO,
                NAT.DESCRNAT AS NATUREZA,
                TOPER.DESCROPER AS TIPO_OPERACAO,
                FIN.VLRBAIXA AS VLRBAIXA
                FROM SANKHYA.TGFFIN FIN
                INNER JOIN SANKHYA.TSIEMP EMP ON EMP.CODEMP = FIN.CODEMP
                INNER JOIN SANKHYA.TGFPAR PAR ON PAR.CODPARC = FIN.CODPARC
                INNER JOIN SANKHYA.TSICTA CTA ON FIN.CODCTABCOINT = CTA.CODCTABCOINT
                INNER JOIN SANKHYA.TGFNAT NAT ON FIN.CODNAT = NAT.CODNAT
                INNER JOIN SANKHYA.TGFTOP TOPER ON TOPER.CODTIPOPER = FIN.CODTIPOPER
                WHERE 
                FIN.RECDESP = -1  
                AND FIN.PROVISAO IN('N','S') 
                AND FIN.DHBAIXA IS NOT NULL 
                AND YEAR(CONVERT(DATE, FIN.DHBAIXA)) BETWEEN '${anoInicial}' AND '${anoFinal}' 
                AND MONTH(CONVERT(DATE, FIN.DHBAIXA)) = ${numeroMes}
                ${banco ? `AND FIN.CODCTABCOINT = ${banco}` : ''}
                ${empresa ? `AND FIN.CODEMP = ${empresa}` : ''}
                AND NOT (FIN.PROVISAO = 'S' AND FIN.DHBAIXA IS NOT NULL AND FIN.ORIGEM = 'E')
                AND  FIN.NUBCO IS NOT NULL
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
                dataNegociacao: item.DATA_NEG,
                dataBaixa: item.DATA_BAIXA,
                nomeParceiro: item.NOME_PARCEIRO,
                banco: item.BANCO,
                natureza: item.NATUREZA,
                tipoOperacao: item.TIPO_OPERACAO,
                vlrBaixa: item.VLRBAIXA
            }));
            setResult(formattedData);
        }
    }, [data]);

    const totalBaixa = result.reduce((acc, item) => acc + item.vlrBaixa, 0);


    const [filters, setFilters] = useState({
        nroUnico: '', numNota: '', nomeEmpresa: '',
        dataNegociacao: '', dataBaixa: '', nomeParceiro: '', banco: '',
        natureza: '', tipoOperacao: '', vlrBaixa: ''
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const filteredResult = result.filter(item =>
        Object.keys(filters).every(key =>
            filters[key] === '' || item[key]?.toString().toLowerCase().includes(filters[key].toLowerCase().trim())
        )
    );

    useEffect(()=>{
        console.log(filters)
    }, [filters])

    if (error) {
        return (
            <div className="flex justify-center items-center">
                Error: {error.message}
            </div>
        );

    }

    return (
        <div
            data-modal-backdrop="static"
            tabIndex="-1"
            aria-hidden="true"
            className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
        >
            <div className="relative w-full h-full p-4">
                <div className="relative w-full h-full bg-white rounded-lg shadow dark:bg-gray-700 overflow-auto">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Detalhes do {tipo}
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={onClose}
                        >
                            <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <div className="p-4 md:p-5 space-y-4">
                        <div className="relative overflow-auto shadow-md sm:rounded-lg max-h-[70vh]">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left">Nro Único</th>
                                        <th scope="col" className="px-6 py-3 text-left">Nro Nota</th>
                                        <th scope="col" className="px-6 py-3 text-left">Empresa</th>
                                        <th scope="col" className="px-6 py-3 text-left">Data de Negociação</th>
                                        <th scope="col" className="px-6 py-3 text-left">Data de Baixa</th>
                                        <th scope="col" className="px-6 py-3 text-left">Parceiro</th>
                                        <th scope="col" className="px-6 py-3 text-left">Banco</th>
                                        <th scope="col" className="px-6 py-3 text-left">Natureza</th>
                                        <th scope="col" className="px-6 py-3 text-left">Tipo de Operação</th>
                                        <th scope="col" className="px-6 py-3 text-left">Valor da Baixa</th>
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
                                                <th scope="row" className="px-2 text-left py-1 font-medium text-gray-900 whitespace-nowrap">{item.nroUnico}</th>
                                                <td className="px-2 py-1 text-left">{item.numNota}</td>
                                                <td className="px-2 py-1 text-left">{item.nomeEmpresa}</td>
                                                <td className="px-2 py-1 text-left">{item.dataNegociacao}</td>
                                                <td className="px-2 py-1 text-left">{item.dataBaixa}</td>
                                                <td className="px-2 py-1 text-left">{item.nomeParceiro}</td>
                                                <td className="px-2 py-1 text-left">{item.banco}</td>
                                                <td className="px-2 py-1 text-left">{item.natureza}</td>
                                                <td className="px-2 py-1 text-left">{item.tipoOperacao}</td>
                                                <td className="px-2 py-1 text-left">{item.vlrBaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))

                                    )}
                                </tbody>
                                {/* <tfoot className="text-[10px] text-gray-700 uppercase bg-gray-50">
                                    <tr className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-2 py-1 font-medium text-gray-900 whitespace-nowrap">Total</th>
                                        <td className="px-2 py-1 text-left"></td>
                                        <td className="px-2 py-1 text-left"></td>
                                        <td className="px-2 py-1 text-left"></td>
                                        <td className="px-2 py-1 text-left"></td>
                                        <td className="px-2 py-1 text-left"></td>
                                        <td className="px-2 py-1 text-left"></td>
                                        <td className="px-2 py-1 text-left"></td>
                                        <td className="px-2 py-1 text-left"></td>

                                        <td className="px-2 py-1 text-left">
                                            {totalBaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        
                                    </tr>
                                </tfoot> */}
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={onClose}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default ModalDetalhamentoRealizado;
