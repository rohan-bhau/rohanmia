import SettingsManager from "@/components/admin/SettingsManager";

export const metadata = {
  title: "Core Configuration | Admin Nexus",
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Central Intelligence Node</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Site <span className="text-primary text-glow">Settings</span>
        </h1>
      </div>

      <SettingsManager />
    </div>
  );
}
