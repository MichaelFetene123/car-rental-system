import clsx from 'clsx';

interface StatusProps {
  status: 'available' | 'rented' | 'maintenance';
  className?: string;
}

const statusStyles = {
  available: 'bg-green-100 text-green-800',
  rented: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
};

export default function CarStatus({ status, className }: StatusProps) {
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <span 
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium', 
        statusStyles[status],
        className
      )}
    >
      {statusLabel}
    </span>
  );
}