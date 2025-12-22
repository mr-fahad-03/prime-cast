"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  email: string;
  country: string | null;
  whatsapp: string | null;
  trialStartDate: string;
  trialDays: number;
  isSubscribed: boolean;
  subscriptionEnd: string | null;
  isSuspended: boolean;
  suspendReason: string | null;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  subscribedUsers: number;
  trialUsers: number;
  expiredTrialUsers: number;
  suspendedUsers: number;
}

// Check if trial expired
const isTrialExpired = (trialStartDate: string, trialDays: number): boolean => {
  const trialStart = new Date(trialStartDate);
  const now = new Date();
  const diffInMs = now.getTime() - trialStart.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  return diffInHours >= (trialDays || 1) * 24;
};

// Get trial time info
const getTrialInfo = (trialStartDate: string, trialDays: number): string => {
  const trialStart = new Date(trialStartDate);
  const now = new Date();
  const diffInMs = now.getTime() - trialStart.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const totalTrialHours = (trialDays || 1) * 24;
  
  if (diffInHours >= totalTrialHours) return "Expired";
  
  const hoursRemaining = Math.floor(totalTrialHours - diffInHours);
  const daysRemaining = Math.floor(hoursRemaining / 24);
  const hours = hoursRemaining % 24;
  
  if (daysRemaining > 0) {
    return `${daysRemaining}d ${hours}h left`;
  }
  return `${hours}h left`;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "subscribed" | "trial" | "expired" | "suspended">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionData, setActionData] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/auth/check");
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push("/prime-cast-admin/login");
        return;
      }
      
      fetchUsers();
    } catch {
      router.push("/prime-cast-admin/login");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/prime-cast-admin/login");
          return;
        }
        setError(data.error || "Failed to fetch users");
      } else {
        setUsers(data.users);
        setStats(data.stats);
      }
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/prime-cast-admin/login");
  };

  const handleAction = async (action: string) => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action,
          data: actionData,
        }),
      });

      if (response.ok) {
        fetchUsers();
        setSelectedUser(null);
        setActionModal(null);
        setActionData({});
      } else {
        const data = await response.json();
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsers();
        setSelectedUser(null);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete user");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.whatsapp?.includes(searchTerm);

    if (!matchesSearch) return false;

    if (filter === "subscribed") return user.isSubscribed && !user.isSuspended;
    if (filter === "suspended") return user.isSuspended;
    if (filter === "trial") return !user.isSubscribed && !user.isSuspended && !isTrialExpired(user.trialStartDate, user.trialDays);
    if (filter === "expired") return !user.isSubscribed && !user.isSuspended && isTrialExpired(user.trialStartDate, user.trialDays);
    
    return true;
  });

  const getUserStatus = (user: User) => {
    if (user.isSuspended) return { label: "Suspended", color: "bg-red-500/20 text-red-400", dot: "bg-red-400" };
    if (user.isSubscribed) return { label: "Subscribed", color: "bg-green-500/20 text-green-400", dot: "bg-green-400" };
    if (isTrialExpired(user.trialStartDate, user.trialDays)) return { label: "Expired", color: "bg-gray-500/20 text-gray-400", dot: "bg-gray-400" };
    return { label: "Trial", color: "bg-yellow-500/20 text-yellow-400", dot: "bg-yellow-400 animate-pulse" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">PrimeCast Admin</h1>
              <p className="text-xs text-gray-400">Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition">
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                <div className="text-white/50 text-sm mt-1">Total Users</div>
              </div>
              <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-5 border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">{stats?.subscribedUsers || 0}</div>
                <div className="text-green-300/60 text-sm mt-1">Subscribed</div>
              </div>
              <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-5 border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400">{stats?.trialUsers || 0}</div>
                <div className="text-yellow-300/60 text-sm mt-1">Active Trials</div>
              </div>
              <div className="bg-gray-500/10 backdrop-blur-sm rounded-xl p-5 border border-gray-500/20">
                <div className="text-2xl font-bold text-gray-400">{stats?.expiredTrialUsers || 0}</div>
                <div className="text-gray-400/60 text-sm mt-1">Expired</div>
              </div>
              <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-5 border border-red-500/20">
                <div className="text-2xl font-bold text-red-400">{stats?.suspendedUsers || 0}</div>
                <div className="text-red-300/60 text-sm mt-1">Suspended</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="all" className="bg-gray-900">All Users</option>
                <option value="subscribed" className="bg-gray-900">Subscribed</option>
                <option value="trial" className="bg-gray-900">Active Trial</option>
                <option value="expired" className="bg-gray-900">Expired Trial</option>
                <option value="suspended" className="bg-gray-900">Suspended</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left text-white/60 text-xs font-medium px-4 py-3 uppercase tracking-wide">User</th>
                      <th className="text-left text-white/60 text-xs font-medium px-4 py-3 uppercase tracking-wide">Country</th>
                      <th className="text-left text-white/60 text-xs font-medium px-4 py-3 uppercase tracking-wide">WhatsApp</th>
                      <th className="text-left text-white/60 text-xs font-medium px-4 py-3 uppercase tracking-wide">Status</th>
                      <th className="text-left text-white/60 text-xs font-medium px-4 py-3 uppercase tracking-wide">Access</th>
                      <th className="text-left text-white/60 text-xs font-medium px-4 py-3 uppercase tracking-wide">Joined</th>
                      <th className="text-left text-white/60 text-xs font-medium px-4 py-3 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-white/30 py-12">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const status = getUserStatus(user);
                        return (
                          <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <div>
                                <div className="text-white font-medium text-sm">{user.name || "No name"}</div>
                                <div className="text-white/40 text-xs">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {user.country && (
                                  <img
                                    src={`https://flagcdn.com/w40/${user.country.toLowerCase()}.png`}
                                    alt={user.country}
                                    className="w-5 h-3.5 object-cover rounded"
                                  />
                                )}
                                <span className="text-white/60 text-sm">{user.country || "—"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {user.whatsapp ? (
                                <a
                                  href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
                                >
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                  </svg>
                                  {user.whatsapp}
                                </a>
                              ) : (
                                <span className="text-white/20 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 ${status.color} text-xs font-medium rounded-full`}>
                                <span className={`w-1.5 h-1.5 ${status.dot} rounded-full`}></span>
                                {status.label}
                              </span>
                              {user.isSuspended && user.suspendReason && (
                                <div className="text-red-400/60 text-xs mt-1 truncate max-w-[120px]" title={user.suspendReason}>
                                  {user.suspendReason}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {user.isSuspended ? (
                                <span className="text-red-400">Blocked</span>
                              ) : user.isSubscribed ? (
                                <div>
                                  <span className="text-green-400">Active</span>
                                  {user.subscriptionEnd && (
                                    <div className="text-white/40 text-xs">
                                      Until {new Date(user.subscriptionEnd).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <span className="text-white/60">{user.trialDays || 1}d trial</span>
                                  <div className="text-white/40 text-xs">
                                    {getTrialInfo(user.trialStartDate, user.trialDays)}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-white/40 text-xs">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 text-center text-white/30 text-sm">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </>
        )}
      </main>

      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedUser.name || "No name"}</h2>
                  <p className="text-white/50 text-sm">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setActionModal(null);
                    setActionData({});
                  }}
                  className="text-white/50 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/50">Country:</span>
                  <span className="text-white ml-2">{selectedUser.country || "—"}</span>
                </div>
                <div>
                  <span className="text-white/50">WhatsApp:</span>
                  <span className="text-white ml-2">{selectedUser.whatsapp || "—"}</span>
                </div>
                <div>
                  <span className="text-white/50">Joined:</span>
                  <span className="text-white ml-2">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-white/50">Status:</span>
                  <span className={`ml-2 ${selectedUser.isSuspended ? "text-red-400" : selectedUser.isSubscribed ? "text-green-400" : "text-yellow-400"}`}>
                    {selectedUser.isSuspended ? "Suspended" : selectedUser.isSubscribed ? "Subscribed" : "Trial"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {!actionModal && (
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {/* Subscription Actions */}
                  {!selectedUser.isSubscribed ? (
                    <button
                      onClick={() => setActionModal("subscribe")}
                      className="px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Subscribe
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction("unsubscribe")}
                      className="px-4 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      Remove Subscription
                    </button>
                  )}

                  {/* Trial Actions */}
                  <button
                    onClick={() => setActionModal("extendTrial")}
                    className="px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Extend Trial
                  </button>

                  {/* Suspend/Unsuspend */}
                  {!selectedUser.isSuspended ? (
                    <button
                      onClick={() => setActionModal("suspend")}
                      className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Suspend User
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction("unsuspend")}
                      className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Unsuspend User
                    </button>
                  )}

                  {/* Reset Trial */}
                  <button
                    onClick={() => setActionModal("resetTrial")}
                    className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Trial
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    className="col-span-2 px-4 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-500 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-red-500/30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete User Permanently
                  </button>
                </div>
              )}

              {/* Subscribe Form */}
              {actionModal === "subscribe" && (
                <div className="pt-4 space-y-4">
                  <h3 className="text-white font-semibold">Set Subscription</h3>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Subscription End Date (optional)</label>
                    <input
                      type="date"
                      value={actionData.endDate || ""}
                      onChange={(e) => setActionData({ ...actionData, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-white/40 text-xs mt-1">Leave empty for unlimited subscription</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActionModal(null)}
                      className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction("subscribe")}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                      {actionLoading ? "Saving..." : "Confirm"}
                    </button>
                  </div>
                </div>
              )}

              {/* Extend Trial Form */}
              {actionModal === "extendTrial" && (
                <div className="pt-4 space-y-4">
                  <h3 className="text-white font-semibold">Extend Trial Period</h3>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Total Trial Days</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={actionData.days || selectedUser.trialDays || 1}
                      onChange={(e) => setActionData({ ...actionData, days: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <p className="text-white/40 text-xs mt-1">Current: {selectedUser.trialDays || 1} day(s)</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActionModal(null)}
                      className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction("extendTrial")}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                      {actionLoading ? "Saving..." : "Extend"}
                    </button>
                  </div>
                </div>
              )}

              {/* Reset Trial Form */}
              {actionModal === "resetTrial" && (
                <div className="pt-4 space-y-4">
                  <h3 className="text-white font-semibold">Reset Trial (Start Fresh)</h3>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">New Trial Days</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={actionData.days || "1"}
                      onChange={(e) => setActionData({ ...actionData, days: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-white/40 text-xs mt-1">This will reset the trial start date to now</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActionModal(null)}
                      className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction("resetTrial")}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                      {actionLoading ? "Saving..." : "Reset Trial"}
                    </button>
                  </div>
                </div>
              )}

              {/* Suspend Form */}
              {actionModal === "suspend" && (
                <div className="pt-4 space-y-4">
                  <h3 className="text-white font-semibold">Suspend User</h3>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Reason for Suspension</label>
                    <textarea
                      value={actionData.reason || ""}
                      onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      rows={3}
                      placeholder="e.g., Sharing account credentials, Data leaking, etc."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActionModal(null)}
                      className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction("suspend")}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                      {actionLoading ? "Suspending..." : "Suspend User"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
