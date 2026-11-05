import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '../Icons';

/** Imagem que abre em tela cheia ao clicar (exceto quando já está dentro de um link). */
export default function ZoomImage({ src, alt = '', title, ...rest }) {
  const [open, setOpen] = useState(false);

  const onClick = (e) => {
    if (e.currentTarget.closest('a')) return;
    setOpen(true);
  };

  return (
    <>
      <img src={src} alt={alt} title={title} loading="lazy" {...rest} onClick={onClick} className="zoomable" />
      {open && createPortal(<Lightbox src={src} alt={alt} caption={title || alt} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function Lightbox({ src, alt, caption, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="lightbox anim-pop" role="dialog" aria-modal="true" aria-label={alt || 'Imagem ampliada'} onClick={onClose}>
      <button type="button" className="lightbox__close" aria-label="Fechar" onClick={onClose}><CloseIcon size={20} /></button>
      <img src={src} alt={alt} />
      {caption && <p className="lightbox__caption">{caption}</p>}
    </div>
  );
}
