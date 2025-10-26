const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800">Selamat Datang di Dashboard Anda</h2>
      <p className="mt-2 text-gray-600">Pilih menu di samping untuk mulai mengelola portofolio Anda.</p>
      <div className="mt-8">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-center text-gray-500">Ringkasan statistik akan ditampilkan di sini.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;