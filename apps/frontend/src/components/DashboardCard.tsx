import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: 'blue' | 'red';
}

export default function DashboardCard({
  title,
  value,
  detail,
  icon,
  tone = 'blue'
}: DashboardCardProps) {
  return (
    <article className={`dashboard-card dashboard-card-${tone}`}>
      <div className="dashboard-card-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </article>
  );
}
