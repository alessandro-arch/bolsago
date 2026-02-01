import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminBanner } from "@/components/admin/AdminBanner";
import { LayoutDashboard } from "lucide-react";

const ManagerDashboard = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminBanner />
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <LayoutDashboard className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Painel do Gestor
            </h2>
            <p className="text-muted-foreground max-w-md">
              Os dashboards serão implementados em breve.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ManagerDashboard;
