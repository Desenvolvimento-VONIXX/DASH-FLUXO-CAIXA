import React, { useEffect, useState } from "react";
import { useConsultar } from "../../../hook/useConsultar";

function FiltroEmpresa({onFilterEmpresa}) {
    const [empresa, setEmpresa] = useState('');
    const [erro, setErro] = useState('');
    const [listEmpresas, setListEmpresas] = useState([])
    const [consulta, setConsulta] = useState('')

    useEffect(() => {
        const novaConsulta = `
            SELECT DISTINCT 
            EMP.CODEMP,
            EMP.NOMEFANTASIA
            FROM SANKHYA.TGFFIN FIN 
            INNER JOIN SANKHYA.TSIEMP EMP ON EMP.CODEMP = FIN.CODEMP
            WHERE 
            FIN.RECDESP IN (1, -1)  
            AND FIN.PROVISAO IN ('N', 'S') 
            AND (FIN.DHBAIXA IS NOT NULL OR FIN.DHBAIXA IS NULL) 
            AND NOT (FIN.PROVISAO = 'S' AND FIN.DHBAIXA IS NOT NULL AND FIN.ORIGEM = 'E');
        `
        setConsulta(novaConsulta);
    }, [])

    const { data, loading, error } = useConsultar(consulta);

    useEffect(() => {
        if (data && data.length > 0) {
            const formattedData = data.map(item => ({
                codEmp: item.CODEMP,
                empresa: item.NOMEFANTASIA,

            }));
            setListEmpresas(formattedData);
        }
    }, [data]);

    const handleFilterClick = () => {
        onFilterEmpresa(empresa);
        setErro('');
    };

    useEffect(() => {
        handleFilterClick();
    }, [empresa]);

    return (
        <div className="">
            <div className="">
                <label htmlFor="data-inicial" className="block text-white font-semibold">Selecionar Empresa</label>
                <select onChange={(e) => setEmpresa(e.target.value)}  id="countries" className={`p-2 bg-gray-50 border ${erro ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[50%]`}>
                    <option value="" selected>Todas</option>
                    {listEmpresas.map((item, index) => (
                        <option value={item.codEmp}>{item.empresa}</option>
                    ))}
                </select>
            </div>
            {erro && <div className="text-red-500">{erro}</div>}
        </div>
    );
}

export default FiltroEmpresa;
