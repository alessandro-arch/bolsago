import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminBanner } from "@/components/admin/AdminBanner";
import { ScholarsTableFiltered } from "@/components/dashboard/ScholarsTableFiltered";

const ManagerDashboard = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminBanner />
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Scholars Management Section */}
          <div className="animate-fade-in">
            <ScholarsTableFiltered />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ManagerDashboard;
