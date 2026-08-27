import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function Section({ title, icon, children }) {
  return (
    <div
      className="pdf-section"
      style={{
        marginTop: "20px",
        paddingTop: "10px",
        paddingBottom: "10px",
        breakInside: "avoid",
      }}
    >
      <h2
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "1.25rem",
          fontWeight: "700",
          color: "#111827",
          borderBottom: "2px solid #E5E7EB",
          paddingBottom: "8px",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            backgroundColor: "#F3F4F6",
            borderRadius: "6px",
            marginRight: "12px",
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon
            icon={icon}
            style={{
              width: "16px",
              height: "16px",
              color: "#4B5563",
            }}
          />
        </span>

        {title.toUpperCase()}
      </h2>

      <div
        style={{
          fontSize: "0.925rem",
          color: "#374151",
          lineHeight: "1.5",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Row({ label, value, colSpan = false }) {
  const hasValue = value !== null && value !== undefined && value !== "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: "12px",
        gridColumn: colSpan ? "span 3" : "span 1",
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: "600",
          color: "#6B7280",
          marginBottom: "4px",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: "0.95rem",
          fontWeight: "500",
          color: "#111827",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {hasValue ? value : "-"}
      </span>
    </div>
  );
}

export function DetailRow({ label, value }) {
  const hasValue = value !== null && value !== undefined && value !== "";

  return (
    <div
      style={{
        padding: "12px 0",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      <div
        style={{
          marginBottom: "6px",
          fontSize: "0.75rem",
          fontWeight: "600",
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "0.85rem",
          fontWeight: "500",
          color: "#111827",
          lineHeight: "1.55",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {hasValue ? value : "-"}
      </div>
    </div>
  );
}

export function Table({ headers = [], rows = [] }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return <EmptyText />;
  }

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.875rem",
        tableLayout: "auto",
      }}
    >
      <thead>
        <tr
          style={{
            borderBottom: "2px solid #E5E7EB",
          }}
        >
          {headers.map((header, index) => (
            <th
              key={`${header}-${index}`}
              style={{
                padding: "12px 8px",
                textAlign: "left",
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                verticalAlign: "bottom",
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            style={{
              borderBottom: "1px solid #F3F4F6",
              breakInside: "avoid",
              pageBreakInside: "avoid",
            }}
          >
            {row.map((cell, cellIndex) => {
              const value = Array.isArray(cell) ? cell.join(", ") : cell;

              return (
                <td
                  key={cellIndex}
                  style={{
                    padding: "12px 8px",
                    color: "#4B5563",
                    verticalAlign: "top",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {value !== null && value !== undefined && value !== ""
                    ? value
                    : "-"}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function EmptyText({ text = "Bu alan doldurulmamış." }) {
  return (
    <p
      style={{
        fontSize: "0.875rem",
        color: "#9CA3AF",
        fontStyle: "italic",
      }}
    >
      {text}
    </p>
  );
}

export function EnumText({ value }) {
  const numericValue = Number(value);

  if (numericValue === 1) {
    return (
      <span
        style={{
          color: "#EF4444",
          fontWeight: "700",
        }}
      >
        Hayır
      </span>
    );
  }

  if (numericValue === 2) {
    return (
      <span
        style={{
          color: "#10B981",
          fontWeight: "700",
        }}
      >
        Evet
      </span>
    );
  }

  if (numericValue === 3) {
    return (
      <span
        style={{
          color: "#F59E0B",
          fontWeight: "700",
        }}
      >
        Kısmen
      </span>
    );
  }

  return <span>-</span>;
}
