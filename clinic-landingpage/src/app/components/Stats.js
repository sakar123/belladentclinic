export default function Stats() {
    const stats = [
      { label: 'Years of Experience', value: '15+' },
      { label: 'Patients Served', value: '10,000+' },
      { label: 'Certified Dentists', value: '8' },
    ];
  
    return (
      <section className="bg-white/60 backdrop-blur-md rounded-xl p-8 max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center shadow-lg border border-white/30">
        {stats.map(({ label, value }) => (
          <div key={label}>
            <h3 className="text-4xl font-bold text-blue-700 mb-2">{value}</h3>
            <p className="text-gray-800 text-lg">{label}</p>
          </div>
        ))}
      </section>
    );
  }
  