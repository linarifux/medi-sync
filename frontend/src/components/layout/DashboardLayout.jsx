import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { logout, reset } from '../../features/auth/authSlice';
import { 
  Activity, LogOut, Package, Clock, ShoppingCart, 
  User as UserIcon, Menu, X, ChevronRight,
  ShoppingCartIcon
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user } = useSelector((state) => state.auth);

  // Close mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  const navItems = [
    { name: 'Inventory', path: '/dashboard', icon: Package },
    { name: 'Restock Hub', path: '/restock', icon: ShoppingCartIcon },
    { name: 'Order History', path: '/orders', icon: ShoppingCart },
    { name: 'Consumption Log', path: '/history', icon: Clock },
  ];

  // Reusable NavLinks component for both Desktop and Mobile views
  const NavLinks = () => (
    <nav className="space-y-1.5">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.path}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {/* Active Indicator Line */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
            )}
            
            <div className="flex items-center gap-3">
              <Icon 
                className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} 
              />
              {item.name}
            </div>
            
            {/* Subtle arrow for mobile or hover state */}
            <ChevronRight 
              className={`h-4 w-4 transition-opacity duration-200 ${
                isActive ? 'opacity-100 text-blue-400' : 'opacity-0 group-hover:opacity-100 text-gray-300'
              }`} 
            />
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* 1. Top Navbar (Sticky & Glassmorphism) */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Left: Branding & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-1.5 rounded-xl shadow-sm group-hover:shadow transition-all">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight hidden sm:block">
                  MediSync
                </span>
              </Link>
            </div>
            
            {/* Right: User Profile & Logout */}
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 pl-2 pr-4 py-1.5 rounded-full shadow-sm">
                <div className="bg-blue-100 p-1 rounded-full">
                  <UserIcon className="h-4 w-4 text-blue-700" />
                </div>
                <span className="text-sm font-bold text-gray-700 truncate max-w-[120px] sm:max-w-[200px]">
                  {user?.name || 'Admin'}
                </span>
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 sm:px-4 sm:py-2 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
            
          </div>
        </div>
      </header>

      {/* 2. Main Layout Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 py-6 gap-8">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 relative">
          <div className="sticky top-24">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">Menu</h2>
            <NavLinks />
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <>
          {/* Overlay */}
          <div 
            className={`md:hidden fixed inset-0 z-20 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Sliding Drawer */}
          <aside 
            className={`md:hidden fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out pt-20 ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="px-4 pb-6 h-full overflow-y-auto">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">Menu</h2>
              <NavLinks />
            </div>
          </aside>
        </>

        {/* 3. Dynamic Page Content */}
        {/* min-w-0 prevents flex items from overflowing when dealing with large tables/data */}
        <main className="flex-1 bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 w-full min-w-0 flex flex-col">
          {children}
        </main>
        
      </div>
    </div>
  );
};

export default DashboardLayout;