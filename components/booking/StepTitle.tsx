interface StepTitleProps {
  title: string;
  subtitle?: string;
}

export function StepTitle({ title, subtitle }: StepTitleProps) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1 leading-snug">{subtitle}</p>
      )}
    </div>
  );
}
