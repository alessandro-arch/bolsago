import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminBanner } from "@/components/admin/AdminBanner";
import { ScholarsTableFiltered } from "@/components/dashboard/ScholarsTableFiltered";
import { ProjectsList } from "@/components/projects";
import { UsersManagement } from "@/components/dashboard/UsersManagement";
import { BankDataManagement } from "@/components/dashboard/BankDataManagement";
import { AdminMasterModeProvider } from "@/contexts/AdminMasterModeContext";

const ManagerDashboard = () => {
  return (
    <AdminMasterModeProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <AdminBanner />
          <Header />
          
          <main className="flex-1 p-6 overflow-auto space-y-6">
            {/* Users Management Section */}
            <div className="animate-fade-in">
              <UsersManagement />
            </div>
            
            {/* Bank Data Management Section */}
            <div className="animate-fade-in">
              <BankDataManagement />
            </div>
            
            {/* Scholars Management Section */}
            <div className="animate-fade-in">
              <ScholarsTableFiltered />
            </div>
            
            {/* Projects Management Section */}
            <div className="animate-fade-in">
              <ProjectsList />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </AdminMasterModeProvider>
  );
};

export default ManagerDashboard;
