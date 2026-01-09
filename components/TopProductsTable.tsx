const products = [
  { name: "Camiseta Negra", qty: 120, total: 2400 },
  { name: "Jeans Azul", qty: 80, total: 3200 },
  { name: "Zapatos Deportivos", qty: 45, total: 4500 },
  { name: "Gorra", qty: 60, total: 900 },
  { name: "Chaqueta", qty: 30, total: 3900 },
];

export default function({ data }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Productos más vendidos
      </h3>

      <table className="w-full text-sm">
        <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-600 border-b">
                <th className="py-2">Producto</th>
                <th className="py-2">Cantidad</th>
                <th className="py-2 text-right">Total</th>
            </tr>
        </thead>
        <tbody className="text-sm text-gray-600">
          {data.length === 0 ? (
          <tr>
            <td colSpan={3} className="py-4 text-center text-gray-400">
              Sube un archivo para ver los datos
            </td>
          </tr>
        ) : (
        data.map((item: any, index: number) => (
        <tr
          key={index}
          className="border-b last:border-0 hover:bg-gray-300 transition"
        >
        <td className="py-2">{item.month}</td>
        <td className="py-2">{item.sales}</td>
        <td className="py-2 text-right">
          ₡{item.sales.toLocaleString()}
        </td>
      </tr>
    ))
  )}
      </tbody>
      </table>
    </div>
  );
}
