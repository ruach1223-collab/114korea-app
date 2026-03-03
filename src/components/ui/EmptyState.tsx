type EmptyStateProps = {
  title: string
  description?: string
  icon?: string
}

export function EmptyState({ title, description, icon = '📋' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  )
}
