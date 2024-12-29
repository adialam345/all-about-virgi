interface FunFactCardProps {
  title: string;
  description: string | null;
  icon?: string;
}

export function FunFactCard({ title, description, icon = "✨" }: FunFactCardProps) {
  return (
    <div className="rounded-lg border border-[#ffffff1a] bg-[#18181b] p-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {description && (
        <p className="text-[#a1a1aa]">{description}</p>
      )}
    </div>
  )
} 