import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import MessagePanel from '../components/MessagePanel';

interface AdminUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
  };
}

export default function Messages() {
  const { user } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAdminUser = async () => {
      if (!user) return;

      try {
        // If user is admin, they need to see all users
        const isAdmin = user.user_metadata?.role === 'admin';

        if (isAdmin) {
          // Admin sees all users with pending/approved applications
          const { data: users, error } = await supabase
            .from('user_requests')
            .select('user_id')
            .in('status', ['pending', 'approved'])
            .limit(1)
            .single();

          if (error) throw error;

          // Get user details
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
            users.user_id
          );

          if (userError) throw userError;
          setAdminUser(userData.user as AdminUser);
        } else {
          // Regular user sees admin
          const { data: adminUsers, error } = await supabase.auth.admin.listUsers();
          
          if (error) throw error;
          
          const admin = adminUsers.users.find(u => u.user_metadata?.role === 'admin');
          if (admin) {
            setAdminUser(admin as AdminUser);
          }
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminUser();
  }, [user]);

  if (!user) return null;

  const isAdmin = user.user_metadata?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={isAdmin ? "/purple" : "/dashboard"} className="inline-flex items-center text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to {isAdmin ? "Admin Panel" : "Dashboard"}
          </Link>
        </div>

        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mr-4">
              <MessageSquare className="h-6 w-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
              Messages
            </h1>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : adminUser ? (
            <MessagePanel
              userId={user.id}
              isAdmin={isAdmin}
              otherUserId={adminUser.id}
              userName={adminUser.user_metadata.full_name || adminUser.email}
            />
          ) : (
            <div className="text-center py-8 text-slate-400">
              No messages available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}