import React, { useEffect, useState } from "react";
import { useConsultar } from "../../../hook/useConsultar";

function FiltroBanco({ onFilterBanco }) {
    const [banco, setBanco] = useState('');
    const [erro, setErro] = useState('');
    const [listBancos, setListBancos] = useState([])
    const [consulta, setConsulta] = useState('')

    useEffect(() => {
        const novaConsulta = `
            SELECT DISTINCT 
            CTA.CODCTABCOINT,
            CTA.DESCRICAO
            FROM SANKHYA.TGFFIN FIN
            INNER JOIN SANKHYA.TSICTA CTA ON FIN.CODCTABCOINT = CTA.CODCTABCOINT
            WHERE 
            FIN.RECDESP IN (1, -1)  
			AND YEAR(FIN.DTNEG) = 2024
            AND FIN.PROVISAO IN ('N', 'S') 
            AND (FIN.DHBAIXA IS NOT NULL OR FIN.DHBAIXA IS NULL) 
            AND NOT (FIN.PROVISAO = 'S' AND FIN.DHBAIXA IS NOT NULL AND FIN.ORIGEM = 'E')
			ORDER BY CTA.CODCTABCOINT
        `
        setConsulta(novaConsulta);
    }, [])

    const { data, loading, error } = useConsultar(consulta);

    useEffect(() => {
        if (data && data.length > 0) {
            const formattedData = data.map(item => ({
                codBanco: item.CODCTABCOINT,
                banco: item.DESCRICAO,

            }));
            setListBancos(formattedData);
        }
    }, [data]);

    const handleFilterClick = () => {
        onFilterBanco(banco);
        setErro('');
    };

    useEffect(() => {
        handleFilterClick();
    }, [banco]);

    return (
        <div className="">
            <div className="">
                <div className="relative">
                    <label htmlFor="data-inicial" className="block text-white font-semibold">Selecionar Banco</label>
                    <select onChange={(e) => setBanco(e.target.value)} id="countries" className={`p-2 bg-gray-50 border ${erro ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full`}>
                        <option value="" selected>Todos</option>
                        {listBancos.map((item, index) => (
                            <option value={item.codBanco}>{item.banco}</option>
                        ))}
                    </select>
                </div>
            </div>
            {erro && <div className="text-red-500">{erro}</div>}
        </div>
    );
}

export default FiltroBanco;
