import "./FestiveTopRibbon.css";

// Fills the thin empty strip between the header and the hero content with
// a scrolling festive ticker (icon + wish, repeated) — same marquee
// technique already used for the product ticker elsewhere on the page,
// just re-themed per-festival via the existing colour/icon data.
export default function FestiveTopRibbon({ festive, theme, Icon }) {
  if (!festive || !theme) return null;

  const vars = {
    "--rb-1": theme.colors[0],
    "--rb-2": theme.colors[1],
    "--rb-3": theme.colors[2],
  };

  const items = Array.from({ length: 8 });

  return (
    <div className="festive-ribbon" style={vars} aria-hidden="true">
      <div className="festive-ribbon-track">
        {[...items, ...items].map((_, i) => (
          <span className="festive-ribbon-item" key={i}>
            <span className="festive-ribbon-icon">
              {Icon && <Icon width={13} height={13} />}
            </span>
            {festive.text}
          </span>
        ))}
      </div>
    </div>
  );
}
