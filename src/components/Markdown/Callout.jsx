import { AlertIcon, BulbIcon, InfoIcon, MessageIcon, StopIcon } from '../Icons';

const TYPES = {
  NOTE: { label: 'Nota', Icon: InfoIcon },
  TIP: { label: 'Dica', Icon: BulbIcon },
  IMPORTANT: { label: 'Importante', Icon: MessageIcon },
  WARNING: { label: 'Atenção', Icon: AlertIcon },
  CAUTION: { label: 'Cuidado', Icon: StopIcon },
};

export default function Callout({ type, children }) {
  const key = type.toUpperCase();
  const { label, Icon } = TYPES[key] ?? TYPES.NOTE;
  return (
    <aside className={`callout callout--${key.toLowerCase()} not-prose`} role="note">
      <div className="callout__title"><Icon size={16} />{label}</div>
      <div className="callout__body">{children}</div>
    </aside>
  );
}
