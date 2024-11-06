import GraficoPrevisto from "../Graficos/GraficoPrevisto";
import TableDetalhamento from "../Graficos/TableReceberPagarPrevisto";
import PrevistoRealizado from "../Graficos/PrevistovsRealizado";
import { useEffect } from "react";

function FluxoCaixaEmAberto({ dataInicial, dataFinal, banco, empresa }) {
    return (
        <div className="grid grid-rows-3 grid-flow-col gap-4 w-full p-2">
            <div className="col-span-8 row-span-6 bg-white p-2 rounded-[10px] shadow-lg border-t-[15px] border-t-[#656fe2]">
                <h3 className="text-gray-800 font-semibold text-[16px]">Saldo Projetado e Saldo Realizado</h3>
                <div className="h-[30vh] w-full">
                    <PrevistoRealizado dataInicial={dataInicial} dataFinal={dataFinal} banco={banco} empresa={empresa}/>
                </div>
            </div>
            <div className="col-span-8 row-span-6 bg-white p-2 rounded-[10px] shadow-lg border-t-[15px] border-t-[#656fe2]">
                <h3 className="text-gray-800 font-semibold text-[16px]">Previsto</h3>
                <div className="h-[30vh] w-full">
                    <GraficoPrevisto dataInicial={dataInicial} dataFinal={dataFinal} banco={banco} empresa={empresa}/>
                </div>
            </div>
            <div className="w-full col-span-4 row-span-12 bg-white text-center p-2 rounded-[10px] shadow-lg h-[78vh] border-t-[15px] border-t-[#656fe2]">
                <TableDetalhamento dataInicial={dataInicial} dataFinal={dataFinal} banco={banco} empresa={empresa} />
            </div>
        </div>
    );
}

export default FluxoCaixaEmAberto;
