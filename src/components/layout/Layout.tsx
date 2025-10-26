import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const getTitleFromPathname = (pathname: string) => {
    switch (pathname) {
        case '/dashboard':
            return 'Dashboard';
        case '/profile':
            return 'Profil Diri';
        case '/skills':
            return 'Skill';
        case '/projects':
            return 'Proyek';
        case '/experience':
            return 'Pengalaman';
        case '/messages':
            return 'Pesan Kontak';
        case '/settings':
            return 'Pengaturan';
        default:
            return 'Dashboard';
    }
};


const Layout = () => {
  const location = useLocation();
  const title = getTitleFromPathname(location.pathname);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;