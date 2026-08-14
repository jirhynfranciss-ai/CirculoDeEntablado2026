import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && <Icon className="h-12 w-12 text-[#D2B48C] mb-4" strokeWidth={1.5} />}
      <h3 className="text-lg font-medium text-[#A0522D] mb-2">{title}</h3>
      {description && <p className="text-sm text-[#A0522D]/70 max-w-sm">{description}</p>}
    </div>
  );
}
