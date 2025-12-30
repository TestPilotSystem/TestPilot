import { Check, Users, X } from "lucide-react";
import Link from "next/link";

export function UserManagementCard({
  pendingRequests,
}: {
  pendingRequests: any[];
}) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
            <Users size={20} />
          </div>
          <h2 className="text-xl font-black text-gray-800">User Management</h2>
        </div>
        {pendingRequests.length > 0 && (
          <span className="bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-full font-bold">
            {pendingRequests.length} PENDING
          </span>
        )}
      </div>

      <div className="space-y-4">
        {pendingRequests.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                <p className="text-[10px] text-gray-400 font-medium">
                  Applied {user.appliedAt}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                <Check size={16} />
              </button>
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/admin/users"
        className="block text-center w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition border-t border-gray-100 pt-6"
      >
        View all students
      </Link>
    </div>
  );
}
