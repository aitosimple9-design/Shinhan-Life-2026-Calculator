export default function RbacBadge({ active }) {
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${active
      ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400'
      : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
      {active ? 'RBAC ACTIVE' : 'DEV MODE'}
    </span>
  );
}
