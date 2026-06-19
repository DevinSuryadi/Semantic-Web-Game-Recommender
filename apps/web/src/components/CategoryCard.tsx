import type { PropertyGroup } from "../types.js";

export function CategoryCard({ group }: { group: PropertyGroup }) {
  return (
    <section className="category-card">
      <h3>{group.name}</h3>
      <div className="chips">
        {group.values.slice(0, 5).map((value) => (
          <span className="chip" key={`${group.name}-${value}`}>
            {value}
          </span>
        ))}
        {group.values.length === 0 && <span className="chip muted">-</span>}
      </div>
    </section>
  );
}
