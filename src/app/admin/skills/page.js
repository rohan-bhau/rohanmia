import SkillManager from '@/components/admin/SkillManager';

export const metadata = {
  title: 'Skill Intelligence Nexus | Admin',
  description: 'Architect your technical arsenal.',
};

export default function AdminSkillsPage() {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div className="space-y-4">
          <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
            Skill <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-white/40 font-medium italic max-w-xl">
            "Architect your technical repertoire. Manage framework hierarchies and immersive engineering tiers."
          </p>
        </div>
      </div>

      <SkillManager />
    </div>
  );
}
