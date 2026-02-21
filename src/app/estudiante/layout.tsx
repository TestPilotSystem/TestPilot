import SideBarStudent from "@/components/layout/SidebarStudent";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      <SideBarStudent />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
