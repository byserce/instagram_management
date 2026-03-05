import DashboardClient from "@/components/dashboard-client";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <DashboardClient />
    </main>
  );
}
