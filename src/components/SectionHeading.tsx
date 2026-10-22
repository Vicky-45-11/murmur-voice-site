import type { ReactNode } from 'react';
import { useReveal } from '../lib/hooks';

interface Props {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  id?: string;
  align?: 'center' | 'left';
}

export default function SectionHeading({ eyebrow, title, body, id, align = 'center' }: Props) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`section-heading reveal align-${align}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {body && <p className="lede">{body}</p>}
    </div>
  );
}
