export const statusLabels: Record<string, string> = {
  pending: 'Čaká na platbu',
  processing: 'Spracovanie',
  on_hold: 'Pozdržané',
  completed: 'Doručené',
  cancelled: 'Zrušené',
  refunded: 'Vrátené',
  failed: 'Zlyhalo',
};

export const statusClass = (status: string) => {
  switch (status) {
    case 'processing':
    case 'completed':
      return 'bg-emerald-500/15 text-emerald-200';
    case 'pending':
    case 'on_hold':
      return 'bg-amber-500/15 text-amber-200';
    default:
      return 'bg-rose-500/15 text-rose-200';
  }
};
