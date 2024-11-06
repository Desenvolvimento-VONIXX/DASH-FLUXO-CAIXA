import { useEffect, useState } from "react";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";
import "./index.css";
import FiltroPeriodo from "./components/Filtros/FiltroPeriodo";
import FiltroBanco from "./components/Filtros/FiltroBanco";
import FluxoCaixa from "./components/FluxoCaixaRealizado/FluxoCaixa";
import FluxoCaixaEmAberto from "./components/FluxoCaixaEmAberto/FluxoCaixaEmAberto.jsx";
import FiltroEmpresa from "./components/Filtros/FiltroEmpresa";

function App() { 
  const [currentView, setCurrentView] = useState("fluxoCaixaRealizado");

  const [dataInicial, setDataInicial] = useState(null);
  const [dataFinal, setDataFinal] = useState(null);
  const [banco, setBanco] = useState(null);
  const [empresa, setEmpresa] = useState(null)

  const handlePageRealizado = () => {
    setCurrentView("fluxoCaixaRealizado")
  };
  const handlePageEmAberto = () => {
    setCurrentView("fluxoCaixaEmAberto")
  };

  const handleFilterChange = (novaDataInicial, novaDataFinal) => {
    setDataInicial(novaDataInicial);
    setDataFinal(novaDataFinal);
  };

  const handleFilterChangeBanco = (novoBanco) => {
    setBanco(novoBanco);
  };

  const handleFilterChangeEmpresa = (novaEmpresa) => {
    setEmpresa(novaEmpresa);
  }


  return (
    <div className="min-h-screen flex flex-col justify-between overflow-hidden">
      <nav className="bg-[#102d65]">
        <div className="w-full flex flex-wrap items-center justify-between mx-auto p-1">
          <div className="flex items-center">
            <img src="/img/logoBranca.png" className="h-10" alt="Logo Vonixx" />
            <span className="text-[25px] pl-5 font-bold text-white leading-none">
              FLUXO DE CAIXA
            </span>
          </div>
          <div className="flex justify-end p-1 space-x-5 flex-wrap">
            <FiltroPeriodo onFilterChange={handleFilterChange} />
            <FiltroBanco onFilterBanco={handleFilterChangeBanco} />
            <FiltroEmpresa onFilterEmpresa={handleFilterChangeEmpresa}/>
          </div>
        </div>
      </nav>

      <div className="flex-grow w-full overflow-auto">
        <div className="w-full">
          {currentView === "fluxoCaixaRealizado" && (
            <FluxoCaixa dataInicial={dataInicial} dataFinal={dataFinal} banco={banco} empresa={empresa} />
          )}
          {currentView === "fluxoCaixaEmAberto" && (
            <FluxoCaixaEmAberto dataInicial={dataInicial} dataFinal={dataFinal} banco={banco} empresa={empresa}/>
          )}
        </div>
      </div>

      <footer className="bg-transparent relative">
        <div className="flex justify-center items-center">
          <button type="button" class="text-white bg-[#24b68c] hover:bg-[#24b68c] focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2" onClick={handlePageRealizado}>Realizado</button>
          <button type="button" class="text-white bg-[#24b68c] hover:bg-[#24b68c] focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2" onClick={handlePageEmAberto}>Em Aberto</button>

        </div>
        {/* <span
          className={`${currentView === "fluxoCaixa" ? "hidden" : ""} m-3 absolute left-0 bottom-0`}
          onClick={handlePrevious}
        >
          <FaArrowAltCircleLeft className="text-[#102d65] text-[50px] icon-arrow" />
        </span>
        <span
          className={`${currentView === "receita" ? "hidden" : ""} m-3 absolute right-0 bottom-0`}
          onClick={handleNext}
        >
          <FaArrowAltCircleRight className="text-[#102d65] text-[50px] icon-arrow" />
        </span> */}
      </footer>
    </div>
  );
}

export default App;
