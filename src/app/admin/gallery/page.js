import GalleryManager from "@/components/admin/GalleryManager";

export const metadata = {
  title: "Gallery Management | Admin Nexus",
};

export default function AdminGalleryPage() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Storage Node 04</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Gallery <span className="text-primary text-glow">Archives</span>
        </h1>
      </div>

      <GalleryManager />
    </div>
  );
}
