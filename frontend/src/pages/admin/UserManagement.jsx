import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { getUsers, deleteUser, reset } from '../features/users/userSlice';
import { Search, Plus, Shield, User, Trash2, Mail, Users as UsersIcon, Eye } from 'lucide-react';
import AddUserModal from '../../components/users/AddUserModal';

const UserManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const dispatch = useDispatch();
  
  // NOTE: Replace with your actual Redux state
  // const { usersList, isLoading } = useSelector((state) => state.users);
  
  // Mock data for UI demonstration until Redux is hooked up
  const isLoading = false;
  const usersList = [
    { _id: '1', name: 'Admin User', email: 'admin@medisync.com', role: 'admin' },
    { _id: '2', name: 'Sarah (Caregiver)', email: 'sarah@example.com', role: 'viewer' },
  ];

  /* useEffect(() => {
    dispatch(getUsers());
    return () => dispatch(reset());
  }, [dispatch]);
  */

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this user? They will immediately lose access.')) {
      // dispatch(deleteUser(id));
      console.log('Deleting user:', id);
    }
  };

  const filteredUsers = useMemo(() => {
    return (usersList || []).filter((u) => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [usersList, searchTerm]);

  if (isLoading && (!usersList || usersList.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="font-medium animate-pulse">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 w-full px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
          <p className="mt-1 sm:mt-2 text-sm text-gray-500 max-w-2xl">
            Control who has access to view or manage the medication inventory.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow active:scale-95 text-sm font-semibold whitespace-nowrap w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" /> Add User
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* DESKTOP VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Permissions</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        <Shield className="h-3.5 w-3.5" /> Admin (Full Access)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        <Eye className="h-3.5 w-3.5" /> Viewer (Read-only)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    <button 
                      onClick={() => handleDelete(user._id)} 
                      className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all opacity-100 lg:opacity-0 group-hover:opacity-100"
                      title="Remove User"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {filteredUsers.map((user) => (
            <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{user.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" /> {user.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                {user.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800">
                    <Shield className="h-3.5 w-3.5" /> Admin Access
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <Eye className="h-3.5 w-3.5" /> Read-only
                  </span>
                )}
                
                <button 
                  onClick={() => handleDelete(user._id)} 
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="px-4 py-16 text-center">
            <UsersIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No users found</h3>
            <p className="text-gray-500 text-xs mt-1">No users match your search criteria.</p>
          </div>
        )}
      </div>

      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

export default UserManagement;