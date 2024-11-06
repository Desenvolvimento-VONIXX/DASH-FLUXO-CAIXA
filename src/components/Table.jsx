function Table() {
  return (
    <>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
              Inventário
              </th>
              <th scope="col" className="px-6 py-3">
              Empresa
              </th>
              <th scope="col" className="px-6 py-3">
              Local
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b hover:bg-gray-50">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
              >11
              </th>
              <td className="px-6 py-4">inventário</td>
              <td className="px-6 py-4">Laptop</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Table;
