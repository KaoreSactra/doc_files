import { toastStore } from '@/lib/library';
import { useStore } from '@/lib/store';

export default function Toaster() {
  const current = useStore(toastStore);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center print:hidden">
      {current && (
        <div key={current.id} className="toast anim-pop rounded-full border border-line bg-fg px-4 py-2 text-sm font-medium text-bg shadow-lg">
          {current.message}
        </div>
      )}
    </div>
  );
}
