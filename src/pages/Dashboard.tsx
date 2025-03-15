import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  LogOut,
  Settings,
  User,
  MessageSquare,
  Bell,
  BarChart3,
  Play,
  Shield,
  Globe,
  Menu,
  X,
  UserCircle,
  Mail,
  Calendar,
  Clock,
  UserX,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import OnboardingPopup from "../components/OnboardingPopup";

// Utility to prevent duplicate toasts
const shownToasts = new Set<string>();
const showUniqueToast = (
  message: string,
  type: "success" | "error",
  id?: string
) => {
  const toastId = id || message;
  if (!shownToasts.has(toastId)) {
    shownToasts.add(toastId);

    if (type === "success") {
      toast.success(message, { id: toastId });
    } else {
      toast.error(message, { id: toastId });
    }

    // Remove from tracking after some time
    setTimeout(() => {
      shownToasts.delete(toastId);
    }, 5000);
  }
};

export default function Dashboard() {
  const { user, signOut, showOnboarding, setShowOnboarding } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(
    null
  );
  const [hasRequest, setHasRequest] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const navigate = useNavigate();

  // Move handleSignOut before it's used
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      showUniqueToast("Failed to sign out", "error", "signout-error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Force show onboarding if not completed
    if (user && !user.user_metadata?.onboarding_complete) {
      setShowOnboarding(true);
    }
  }, [user, setShowOnboarding]);

  // Check application status periodically
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;

      try {
        // First check if user has any requests
        const { data: requests, error: countError } = await supabase
          .from("user_requests")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (countError) throw countError;

        setHasRequest(!!requests);

        // Only fetch status if user has a request
        if (requests) {
          const { data, error } = await supabase
            .from("user_requests")
            .select("status")
            .eq("user_id", user.id)
            .single();

          if (error) throw error;

          setApplicationStatus(data?.status || null);

          // If rejected, get the rejection reason
          if (data?.status === "rejected") {
            const { data: accessData } = await supabase
              .from("admin_access")
              .select("access_reason")
              .eq("accessed_user_id", user.id)
              .order("accessed_at", { ascending: false })
              .limit(1)
              .single();

            setRejectionReason(accessData?.access_reason || null);
          }

          // If application is approved, show success message and stop checking
          if (data?.status === "approved") {
            toast.success("Your application has been approved!", {
              duration: 5000,
              icon: "🎉",
            });
          } else if (data?.status === "rejected") {
            toast.error("Your application has been rejected.", {
              duration: 5000,
            });
            // Redirect to home page if rejected
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Error checking application status:", error);
      }
    };

    // Check immediately and then every 30 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [user, navigate]);

  // Redirect to home if no request or rejected
  useEffect(() => {
    if (hasRequest && applicationStatus === "rejected") {
      navigate("/");
    }
  }, [hasRequest, applicationStatus, navigate]);
  if (isLoading && !applicationStatus && !showOnboarding) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
          <span className="text-white text-sm">Loading...</span>
        </div>
      </div>
    );
  }
  // Show loading state while checking application
  if (hasRequest && applicationStatus === "pending") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl"></div>

        <div className="max-w-2xl w-full bg-slate-800/90 backdrop-blur-sm p-12 rounded-2xl shadow-2xl text-center relative">
          {/* Animated loading spinner */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-purple-500/20"></div>
            <div
              className="absolute inset-2 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"
              style={{ animationDuration: "2s" }}
            ></div>
          </div>

          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 mb-6">
            Application Pending
          </h2>

          <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-xl mx-auto">
            Your application is currently under review by our team. You'll be
            automatically redirected to your dashboard once it's approved.
          </p>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-red-600/90 hover:bg-red-700 rounded-lg transition-colors mb-8 group"
          >
            <LogOut className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Sign Out
          </button>

          <div className="flex items-center justify-center space-x-2 text-slate-400">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-[moveRight_1.5s_ease-in-out_infinite]"></div>
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-[moveRight_1.5s_ease-in-out_0.2s_infinite]"></div>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-[moveRight_1.5s_ease-in-out_0.4s_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show rejection page
  if (hasRequest && applicationStatus === "rejected") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-slate-500/10 to-red-500/10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-3xl"></div>

        <div className="max-w-2xl w-full bg-slate-800/90 backdrop-blur-sm p-12 rounded-2xl shadow-2xl text-center relative">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <UserX className="h-12 w-12 text-red-400" />
          </div>

          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-300 mb-6">
            Application Rejected
          </h2>

          <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-xl mx-auto">
            We're sorry, but your application has been rejected.
          </p>

          {rejectionReason && (
            <div className="bg-slate-700/50 p-6 rounded-lg mb-8 text-left">
              <h3 className="text-lg font-semibold text-white mb-2">
                Reason for Rejection:
              </h3>
              <p className="text-slate-300">{rejectionReason}</p>
            </div>
          )}

          <p className="text-slate-400 mb-8">
            You can try submitting a new application after addressing the
            feedback provided.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-red-600/90 hover:bg-red-700 rounded-lg transition-colors group order-2 md:order-1"
            >
              <LogOut className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
              Sign Out
            </button>

            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors order-1 md:order-2"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>

            <button
              onClick={() => {
                // Reset user metadata and redirect to onboarding
                setShowOnboarding(true);
              }}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors order-3"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navigationItems = [
    {
      name: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/features/analytics",
      count: "12",
    },
    {
      name: "Channel Management",
      icon: <Play className="h-5 w-5" />,
      href: "/features/channel-management",
    },
    {
      name: "Digital Rights",
      icon: <Shield className="h-5 w-5" />,
      href: "/features/digital-rights",
    },
    {
      name: "Global Distribution",
      icon: <Globe className="h-5 w-5" />,
      href: "/features/global-distribution",
    },
  ];

  const userStats = {
    joinDate: new Date(user?.created_at || Date.now()).toLocaleDateString(),
    lastLogin: new Date(
      user?.last_sign_in_at || Date.now()
    ).toLocaleDateString(),
    accountType: "Pro User",
    contentCount: 156,
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Onboarding Popup */}
      {showOnboarding && user && (
        <OnboardingPopup
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          userId={user.id}
          userEmail={user.email || ""}
        />
      )}

      {/* Sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-slate-800">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <img
                src="https://dlveiezovfooqbbfzfmo.supabase.co/storage/v1/object/public/Images//mtiger.png"
                alt="MediaTiger Logo"
                className="h-8 w-8"
              />
              <span className="ml-2 text-xl font-bold text-white">
                MediaTiger
              </span>
            </div>

            {/* User Profile Summary */}
            <div className="px-4 py-6 text-center">
              <div className="relative inline-block">
                <div className="h-24 w-24 rounded-full bg-indigo-600 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.user_metadata?.full_name?.[0]?.toUpperCase() || (
                    <UserCircle className="h-16 w-16" />
                  )}
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                Welcome,{" "}
                {user?.user_metadata?.full_name?.split(" ")[0] || "User"}!
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                {userStats.accountType}
              </p>
              <div className="flex justify-center space-x-2">
                <Link
                  to="/profile"
                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                >
                  View Profile
                </Link>
                <Link
                  to="/settings"
                  className="px-3 py-1 text-xs bg-slate-700 text-white rounded-full hover:bg-slate-600"
                >
                  Settings
                </Link>
              </div>
            </div>

            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                  {item.count && (
                    <span className="ml-auto bg-slate-900 py-0.5 px-2 rounded-full text-xs">
                      {item.count}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="fixed inset-0 z-40 flex">
          <div
            className={`fixed inset-0 bg-slate-600 bg-opacity-75 transition-opacity ease-in-out duration-300 ${
              isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div
            className={`relative flex w-full max-w-xs flex-1 flex-col bg-slate-800 pt-5 pb-4 transform transition ease-in-out duration-300 ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="absolute top-1 right-0 -mr-14 p-1">
              <button
                type="button"
                className={`h-12 w-12 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white ${
                  isMobileMenuOpen ? "" : "hidden"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex-shrink-0 flex items-center px-4">
              <img
                src="https://dlveiezovfooqbbfzfmo.supabase.co/storage/v1/object/public/Images//mtiger.png"
                alt="MediaTiger Logo"
                className="h-8 w-8"
              />
              <span className="ml-2 text-xl font-bold text-white">
                MediaTiger
              </span>
            </div>

            {/* Mobile User Profile Summary */}
            <div className="px-4 py-6 text-center">
              <div className="h-20 w-20 rounded-full bg-indigo-600 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                {user?.user_metadata?.full_name?.[0]?.toUpperCase() || (
                  <UserCircle className="h-12 w-12" />
                )}
              </div>
              <h2 className="text-lg font-bold text-white mb-1">
                Welcome,{" "}
                {user?.user_metadata?.full_name?.split(" ")[0] || "User"}!
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                {userStats.accountType}
              </p>
            </div>

            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                    {item.count && (
                      <span className="ml-auto bg-slate-900 py-0.5 px-2 rounded-full text-xs">
                        {item.count}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-slate-800 pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
                <div className="flex items-center space-x-4">
                  <button className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700">
                    <Bell className="h-6 w-6" />
                  </button>
                  <Link
                    to="/settings"
                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <Settings className="h-6 w-6" />
                  </Link>
                  <Link
                    to="/messages"
                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <MessageSquare className="h-6 w-6" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* User Profile Overview */}
              <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                    <Mail className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="text-sm font-medium text-white">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                    <Calendar className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-sm text-slate-400">Joined</p>
                      <p className="text-sm font-medium text-white">
                        {userStats.joinDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                    <Clock className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-sm text-slate-400">Last Login</p>
                      <p className="text-sm font-medium text-white">
                        {userStats.lastLogin}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                    <Play className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-sm text-slate-400">Content Items</p>
                      <p className="text-sm font-medium text-white">
                        {userStats.contentCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Analytics Card */}
                  <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-indigo-500 bg-opacity-10">
                        <BarChart3 className="h-8 w-8 text-indigo-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-400">
                          Total Views
                        </p>
                        <p className="text-2xl font-semibold text-white">
                          2.6M
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Channels Card */}
                  <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
                        <Play className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-400">
                          Active Channels
                        </p>
                        <p className="text-2xl font-semibold text-white">12</p>
                      </div>
                    </div>
                  </div>

                  {/* Rights Card */}
                  <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-yellow-500 bg-opacity-10">
                        <Shield className="h-8 w-8 text-yellow-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-400">
                          Protected Assets
                        </p>
                        <p className="text-2xl font-semibold text-white">847</p>
                      </div>
                    </div>
                  </div>

                  {/* Distribution Card */}
                  <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-500 bg-opacity-10">
                        <Globe className="h-8 w-8 text-purple-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-400">
                          Global Reach
                        </p>
                        <p className="text-2xl font-semibold text-white">50+</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8">
                  <h2 className="text-lg font-medium text-white mb-4">
                    Recent Activity
                  </h2>
                  <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="divide-y divide-slate-700">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="p-4 hover:bg-slate-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-500 bg-opacity-10 flex items-center justify-center">
                                <Play className="h-4 w-4 text-indigo-500" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-white">
                                  New video published
                                </p>
                                <p className="text-xs text-slate-400">
                                  Channel: Main Content
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400">
                              2h ago
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
