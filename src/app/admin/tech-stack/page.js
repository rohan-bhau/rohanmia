import TechStackManager from '@/components/admin/TechStackManager';

export const metadata = {
  title: 'Tech Stack Command | Admin',
  description: 'Manage your universal engineering library.',
};

export default function AdminTechStackPage() {
  return (
    <div className="space-y-12">

      <TechStackManager />
    </div>
  );
}
