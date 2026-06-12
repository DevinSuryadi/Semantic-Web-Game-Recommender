import type { Page } from "../types.js";

export function Topbar({
  page,
  onHome,
  onLibrary
}: {
  page: Page;
  onHome: () => void;
  onLibrary: () => void;
}) {
  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={onHome}>
        <span className="brand-icon" aria-hidden="true">
          +
        </span>
        <span>GameFeel</span>
      </button>

      <nav className="nav-links" aria-label="Main navigation">
        <button className={page === "home" ? "active" : ""} type="button" onClick={onHome}>
          Home
        </button>
        <button className={page === "library" ? "active" : ""} type="button" onClick={onLibrary}>
          Library
        </button>
      </nav>
    </header>
  );
}
