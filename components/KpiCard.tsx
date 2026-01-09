type Props = {
  title: string;
  value: string;
  highlight?: boolean;
};

export default function KpiCard({ title, value, highlight }: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1">
        {title}
      </p>


      <h2
        className={`text-4xl font-extrabold ${
          highlight ? "text-green-600" : "text-gray-900"
        }`}
      >
        {value}
      </h2>
    </div>
  );
}
