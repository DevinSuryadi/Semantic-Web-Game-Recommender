import { useEffect, useRef, useState } from "react";

export function MultiSelectFilter({
  label,
  onChange,
  options,
  selected
}: {
  label: string;
  onChange: (values: string[]) => void;
  options: string[];
  selected: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const filterRef = useRef<HTMLElement | null>(null);
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(inputValue.trim().toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  function addValue(value: string) {
    if (!selected.includes(value)) {
      onChange([...selected, value]);
    }
    setInputValue("");
    setIsOpen(true);
  }

  function removeValue(value: string) {
    onChange(selected.filter((item) => item !== value));
  }

  return (
    <section className="filter-field" ref={filterRef}>
      <h3>{label}</h3>
      <div className="multi-select">
        <div
          className={isOpen ? "selected-values open" : "selected-values"}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && isOpen) {
              event.preventDefault();
              setIsOpen(false);
            }
          }}
        >
          {selected.map((value) => (
            <span key={value}>
              {value}
              <button type="button" onClick={() => removeValue(value)}>
                x
              </button>
            </span>
          ))}
          <input
            onMouseDown={(event) => {
              if (isOpen && document.activeElement === event.currentTarget) {
                event.preventDefault();
                event.currentTarget.blur();
                setIsOpen(false);
              }
            }}
            onChange={(event) => {
              setInputValue(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && filteredOptions[0]) {
                event.preventDefault();
                addValue(filteredOptions[0]);
              }
            }}
            placeholder={selected.length === 0 ? `Select ${label.toLowerCase()}` : ""}
            value={inputValue}
          />
        </div>

        {isOpen && filteredOptions.length > 0 && (
          <div className="filter-dropdown">
            {filteredOptions.map((option) => (
              <button
                className={selected.includes(option) ? "selected" : ""}
                key={option}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  addValue(option);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
