import { Sun, Moon, ArrowUpRight } from "lucide-react";
export default function Header({ theme, toggle, connection }) {
  return (
    <header className="header">
      <a className="brand" href="#main">
        <span className="brand-icon">
          <img className="brand-logo" src="/jobguard-logo.png" alt="" width="42" height="42" />
        </span>
        <span>
          JobGuard <b>AI</b>
          <small>A considered approach to job safety</small>
        </span>
      </a>
      <div className="header-actions">
        <span className={"connection " + connection.toLowerCase()}>
          <i />
          {connection}
        </span>
        <button
          className="icon-button"
          onClick={toggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <a className="guide-link" href="#safety">
          Safety guide <ArrowUpRight size={15} />
        </a>
      </div>
    </header>
  );
}
