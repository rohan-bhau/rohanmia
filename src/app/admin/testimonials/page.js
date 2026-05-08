import TestimonialManager from "@/components/admin/TestimonialManager";

export const metadata = {
  title: "Testimonial Moderation | Admin Nexus",
};

export default function AdminTestimonialsPage() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Signal Moderation Node</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Testimonial <span className="text-primary text-glow">Archives</span>
        </h1>
      </div>

      <TestimonialManager />
    </div>
  );
}
