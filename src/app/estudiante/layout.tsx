import SideBarStudent from "@/components/layout/SidebarStudent";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <SideBarStudent />
      <div className="flex-1">{children}</div>
    </div>
  );
}
