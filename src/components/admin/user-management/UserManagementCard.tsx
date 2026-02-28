import { Check, Users, X } from "lucide-react";
import Link from "next/link";

export function UserManagementCard({
  pendingRequests,
}: {
  pendingRequests: any[];
}) {
  return (
    <div className="bg-surface rounded-[2.5rem] p-8 border border-slate-700/50 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-highlight/10 text-highlight rounded-xl">
            <Users size={20} />
          </div>
          <h2 className="text-xl font-black text-slate-100">User Management</h2>
        </div>
        {pendingRequests.length > 0 && (
          <span className="bg-red-500/10 text-red-400 text-[10px] px-2 py-1 rounded-full font-bold border border-red-500/20">
            {pendingRequests.length} PENDING
          </span>
        )}
      </div>

      <div className="space-y-4">
        {pendingRequests.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Applied {user.appliedAt}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition">
                <Check size={16} />
              </button>
              <button className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition">
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/admin/users"
        className="block text-center w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-300 transition border-t border-slate-700/50 pt-6"
      >
        View all students
      </Link>
    </div>
  );
}
