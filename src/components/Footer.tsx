import Logo from './Logo';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '#demo', label: 'Live demo' },
      { href: '#features', label: 'Features' },
      { href: '#pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '#use-cases', label: 'Use cases' },
      { href: '#faq', label: 'FAQ' },
      { href: '#top', label: 'Back to top' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>A concept voice-to-text product and front-end study. Not affiliated with any dictation company.</p>
          </div>
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="footer-col">
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="footer-word" aria-hidden="true">
          murmur
        </p>
        <p className="footer-legal">© {new Date().getFullYear()} Murmur concept. Built with React and Vite.</p>
      </div>
    </footer>
  );
}
