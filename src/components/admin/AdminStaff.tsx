import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Check, 
  X, 
  KeyRound, 
  AlertCircle, 
  UserPlus, 
  CheckCircle2, 
  Edit3, 
  ChevronDown, 
  Lock,
  Sparkles
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { UserRole } from '../../types';

const ROLES: UserRole[] = ['Owner', 'Manager', 'Inventory', 'Cashier', 'Support'];

const ROLE_COLORS: Record<UserRole, { badge: string; border: string; text: string; bg: string }> = {
  Owner: {
    badge: 'bg-brand/15 text-brand border-brand/40 shadow-[0_0_12px_rgba(255,107,26,0.25)]',
    border: 'border-brand/40',
    text: 'text-brand',
    bg: 'bg-brand'
  },
  Manager: {
    badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    bg: 'bg-indigo-500'
  },
  Inventory: {
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    bg: 'bg-amber-500'
  },
  Cashier: {
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500'
  },
  Support: {
    badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500'
  }
};

export const AdminStaff: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    staffUsers, 
    updateStaffRole, 
    addStaffUser, 
    toggleStaffStatus 
  } = useAdmin();

  const [notification, setNotification] = useState<string | null>(null);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('Cashier');

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleRoleChange = (staffId: string, staffName: string, newRole: UserRole) => {
    updateStaffRole(staffId, newRole);
    setEditingStaffId(null);
    triggerNotification(`Role for ${staffName} successfully updated to ${newRole}. Permissions updated.`);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    addStaffUser({
      name: newStaffName.trim(),
      email: newStaffEmail.trim(),
      role: newStaffRole,
      active: true,
      lastLogin: 'Just added'
    });

    triggerNotification(`Added new staff member: ${newStaffName} (${newStaffRole})`);
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffRole('Cashier');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-brand font-bold bg-brand/10 border border-brand/20 px-2 py-0.5 rounded">
              PRD SECTION 6 • RBAC
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>Staff & Role-Based Access Control</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin role management with Principle of Least Privilege. Click on any staff role below to edit it live.
          </p>
        </div>

        {/* Live Role Perspective Simulator */}
        <div className="flex flex-col sm:items-end gap-1.5">
          <div className="flex items-center gap-1.5 bg-[#0f1725] border border-dark-border p-1.5 rounded-xl self-start">
            <span className="text-[11px] font-bold text-slate-400 pl-2">Active Role:</span>
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => {
                  setCurrentRole(role);
                  triggerNotification(`Switched active perspective to ${role}`);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  currentRole === role
                    ? 'bg-brand text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{role}</span>
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Simulating admin permissions as: <strong className="text-brand">{currentRole}</strong>
          </span>
        </div>
      </div>

      {/* Floating Success Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-emerald-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Authorized Staff Accounts Table */}
      <div className="bg-[#0f1725] border border-dark-border rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-brand" />
              <span>Authorized Staff Accounts</span>
              <span className="text-xs font-mono font-normal bg-white/5 px-2 py-0.5 rounded-full text-slate-400">
                {staffUsers.length} total
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Administrators can edit roles directly by clicking the role badge in the table.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-emberStart to-brand-emberEnd hover:from-brand hover:to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition self-start sm:self-auto hover:scale-[1.02] active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Staff Member</span>
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#121a28] text-slate-400 border-b border-dark-border uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="p-3.5">Staff Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Role (Editable)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Last Active</th>
                <th className="p-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40">
              {staffUsers.map(st => {
                const roleConfig = ROLE_COLORS[st.role];
                const isEditing = editingStaffId === st.id;

                return (
                  <tr key={st.id} className="hover:bg-[#121c2c] transition-colors group">
                    
                    {/* Staff Name */}
                    <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand font-bold text-xs uppercase">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <div>{st.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono sm:hidden">{st.email}</div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                      {st.email}
                    </td>

                    {/* Role Column (Interactive & Editable) */}
                    <td className="p-3.5">
                      {isEditing ? (
                        <div className="flex items-center gap-2 animate-fade-in">
                          <select
                            value={st.role}
                            onChange={(e) => handleRoleChange(st.id, st.name, e.target.value as UserRole)}
                            className="bg-[#1a2333] border border-brand text-white font-bold text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand shadow-lg cursor-pointer"
                            autoFocus
                          >
                            {ROLES.map(r => (
                              <option key={r} value={r} className="bg-[#0f1725] text-white">
                                {r}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setEditingStaffId(null)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingStaffId(st.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition transform hover:scale-105 active:scale-95 group/role ${roleConfig.badge}`}
                            title="Click to edit role"
                          >
                            <span>{st.role}</span>
                            <Edit3 className="w-3 h-3 opacity-60 group-hover/role:opacity-100 transition" />
                          </button>
                          
                          <select
                            value={st.role}
                            onChange={(e) => handleRoleChange(st.id, st.name, e.target.value as UserRole)}
                            className="bg-[#151D2A] text-[11px] text-slate-400 border border-dark-border rounded px-1.5 py-1 hover:border-brand hover:text-white cursor-pointer focus:outline-none focus:border-brand"
                            title="Quick change role"
                          >
                            {ROLES.map(r => (
                              <option key={r} value={r} className="bg-[#0f1725] text-white">
                                Switch to {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <button
                        onClick={() => {
                          toggleStaffStatus(st.id);
                          triggerNotification(`Status for ${st.name} toggled.`);
                        }}
                        className={`inline-flex items-center gap-1.5 font-semibold text-[11px] px-2 py-0.5 rounded-full border transition ${
                          st.active
                            ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20'
                            : 'text-red-400 border-red-500/20 bg-red-500/10 hover:bg-red-500/20'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${st.active ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        <span>{st.active ? 'Active' : 'Suspended'}</span>
                      </button>
                    </td>

                    {/* Last Active */}
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {st.lastLogin}
                    </td>

                    {/* Quick Action */}
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setEditingStaffId(isEditing ? null : st.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-brand hover:text-white text-slate-400 font-medium text-[11px] transition inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditing ? 'Done' : 'Change Role'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRD Section 6.2 Permission Matrix Table */}
      <div className="bg-[#0f1725] border border-dark-border rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Default Role Permissions Matrix (PRD Section 6.2)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly enforces who can view cost prices, delete products, issue refunds, or access settings.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Highlighted perspective:</span>
            <span className={`px-2 py-0.5 rounded font-bold ${ROLE_COLORS[currentRole].badge}`}>
              {currentRole}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-center border border-dark-border rounded-xl">
            <thead className="bg-[#121a28] text-slate-300 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="p-3 text-left">Permission Action</th>
                <th className={`p-3 transition-colors ${currentRole === 'Owner' ? 'bg-brand/20 text-brand font-bold' : ''}`}>Owner</th>
                <th className={`p-3 transition-colors ${currentRole === 'Manager' ? 'bg-indigo-500/20 text-indigo-400 font-bold' : ''}`}>Manager</th>
                <th className={`p-3 transition-colors ${currentRole === 'Inventory' ? 'bg-amber-500/20 text-amber-400 font-bold' : ''}`}>Inventory</th>
                <th className={`p-3 transition-colors ${currentRole === 'Cashier' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : ''}`}>Cashier</th>
                <th className={`p-3 transition-colors ${currentRole === 'Support' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : ''}`}>Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40 text-slate-300">
              <tr>
                <td className="p-3 text-left font-semibold text-white">View Reports & Dashboard</td>
                <td className={currentRole === 'Owner' ? 'bg-brand/10' : ''}><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className={currentRole === 'Manager' ? 'bg-indigo-500/10' : ''}><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className={`text-slate-500 ${currentRole === 'Inventory' ? 'bg-amber-500/10 text-amber-300 font-bold' : ''}`}>Stock only</td>
                <td className={`text-slate-500 ${currentRole === 'Cashier' ? 'bg-emerald-500/10 text-emerald-300 font-bold' : ''}`}>Own shift</td>
                <td className={`text-slate-600 ${currentRole === 'Support' ? 'bg-cyan-500/10' : ''}`}>—</td>
              </tr>
              <tr>
                <td className="p-3 text-left font-semibold text-white">Add / Edit Products</td>
                <td className={currentRole === 'Owner' ? 'bg-brand/10' : ''}><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className={currentRole === 'Manager' ? 'bg-indigo-500/10' : ''}><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className={`text-slate-500 ${currentRole === 'Inventory' ? 'bg-amber-500/10 text-amber-300 font-bold' : ''}`}>Limited (stock)</td>
                <td className={`text-slate-600 ${currentRole === 'Cashier' ? 'bg-emerald-500/10' : ''}`}>—</td>
                <td className={`text-slate-600 ${currentRole === 'Support' ? 'bg-cyan-500/10' : ''}`}>—</td>
              </tr>
              <tr>
                <td className="p-3 text-left font-semibold text-white">Delete Products (Destructive)</td>
                <td className={currentRole === 'Owner' ? 'bg-brand/10' : ''}><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className={`text-slate-600 ${currentRole === 'Manager' ? 'bg-indigo-500/10' : ''}`}>—</td>
                <td className={`text-slate-600 ${currentRole === 'Inventory' ? 'bg-amber-500/10' : ''}`}>—</td>
                <td className={`text-slate-600 ${currentRole === 'Cashier' ? 'bg-emerald-500/10' : ''}`}>—</td>
                <td className={`text-slate-600 ${currentRole === 'Support' ? 'bg-cyan-500/10' : ''}`}>—</td>
              </tr>
              <tr>
                <td className="p-3 text-left font-semibold text-white">Open POS and Create Bills</td>
                <td className={currentRole === 'Owner' ? 'bg-brand/10' : ''}><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className={currentRole === 'Manager' ? 'bg-indigo-500/10' : ''}><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className={`text-slate-600 ${currentRole === 'Inventory' ? 'bg-amber-500/10' : ''}`}>—</td>
                <td className={currentRole === 'Cashier' ? 'bg-emerald-500/10' : ''}><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className={`text-slate-600 ${currentRole === 'Support' ? 'bg-cyan-500/10' : ''}`}>—</td>
              </tr>
              <tr>
                <td className="p-3 text-left font-semibold text-white">Manage Settings, API Keys & Staff Roles</td>
                <td className={currentRole === 'Owner' ? 'bg-brand/10' : ''}><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className={`text-slate-600 ${currentRole === 'Manager' ? 'bg-indigo-500/10' : ''}`}>—</td>
                <td className={`text-slate-600 ${currentRole === 'Inventory' ? 'bg-amber-500/10' : ''}`}>—</td>
                <td className={`text-slate-600 ${currentRole === 'Cashier' ? 'bg-emerald-500/10' : ''}`}>—</td>
                <td className={`text-slate-600 ${currentRole === 'Support' ? 'bg-cyan-500/10' : ''}`}>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0E131D] border border-dark-border rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand" />
                <h3 className="text-base font-bold text-white">Add New Staff Member</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Varma"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-[#151D2A] text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-dark-border focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Official Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@gadgethouse.in"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full bg-[#151D2A] text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-dark-border focus:border-brand focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Assigned Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as UserRole)}
                  className="w-full bg-[#151D2A] text-xs text-white px-3.5 py-2.5 rounded-xl border border-dark-border focus:border-brand focus:outline-none cursor-pointer"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r} className="bg-[#0E131D]">
                      {r}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Role can be changed at any time by an administrator in this dashboard.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-emberStart to-brand-emberEnd hover:from-brand hover:to-orange-600 text-white text-xs font-bold shadow-md transition"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
