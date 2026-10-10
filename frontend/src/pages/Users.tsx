import React from 'react';
import { Users as UsersIcon, Shield, CheckCircle2, UserPlus } from 'lucide-react';

export const Users: React.FC = () => {
  const users = [
    {
      id: 1,
      name: 'Rajendra Deshmukh',
      username: 'admin',
      role: 'ADMIN',
      badge: 'MH-ADM-001',
      email: 'admin@landsetu.gov.in',
      phone: '+91 98220 12345',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Bhumi Abhilekh Surveyor',
      username: 'surveyor',
      role: 'SURVEYOR',
      badge: 'MH-SURV-089',
      email: 'surveyor@landsetu.gov.in',
      phone: '+91 94231 67890',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Circle Officer / Verifier',
      username: 'verifier',
      role: 'VERIFIER',
      badge: 'MH-VERIF-042',
      email: 'verifier@landsetu.gov.in',
      phone: '+91 98810 54321',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Public Citizen Viewer',
      username: 'viewer',
      role: 'VIEWER',
      badge: 'MH-PUB-101',
      email: 'viewer@landsetu.gov.in',
      phone: '+91 97654 11223',
      status: 'Active'
    }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-blue-600" />
            <span>User & Access Control (RBAC)</span>
          </h1>
          <p className="text-slate-500">Authorized survey officers, circle verifiers, and tahsil administrators</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Officer Name</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Badge ID</th>
              <th className="py-3 px-4">Official Email</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4 text-center">Account Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                    u.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : u.role === 'SURVEYOR'
                      ? 'bg-blue-100 text-blue-700'
                      : u.role === 'VERIFIER'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Shield className="w-3 h-3" />
                    <span>{u.role}</span>
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-slate-700">{u.badge}</td>
                <td className="py-3 px-4 text-slate-600">{u.email}</td>
                <td className="py-3 px-4 text-slate-600">{u.phone}</td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
