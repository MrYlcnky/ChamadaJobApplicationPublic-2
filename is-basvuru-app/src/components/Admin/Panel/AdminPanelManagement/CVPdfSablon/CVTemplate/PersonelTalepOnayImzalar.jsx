const APPROVAL_STATUSES = ["Onaylandı", "Reddedildi", "Beklemede"];

const SIGNATURE_ROLES = [
  {
    key: "departman-muduru",
    title: "Departman Müdürü",
    showStatuses: false,
  },
  {
    key: "insan-kaynaklari-muduru",
    title: "İnsan Kaynakları Müdürü",
    showStatuses: false,
  },
  {
    key: "genel-mudur",
    title: "Genel Müdür",
    showStatuses: true,
  },
  {
    key: "mali-isler-muduru",
    title: "Mali İşler Müdürü",
    showStatuses: true,
  },
];

function StaticCheckbox({ label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        marginBottom: "4px",
        color: "#111827",
        fontSize: "0.75rem",
        fontWeight: "600",
        lineHeight: "1.2",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "10px",
          height: "10px",
          flexShrink: 0,
          border: "1px solid #111827",
          backgroundColor: "#FFFFFF",
          boxSizing: "border-box",
        }}
      />

      <span>{label}</span>
    </div>
  );
}

function SignatureCard({ title, showStatuses = false }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "185px",
        flexDirection: "column",
        padding: "10px",
        boxSizing: "border-box",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      {/* İMZA ALANI */}
      <div
        style={{
          height: "58px",
          marginBottom: "10px",
          borderBottom: "1px solid #374151",
        }}
      />

      {/* ROL */}
      <div
        style={{
          minHeight: "38px",
          color: "#111827",
          fontSize: "0.8rem",
          fontWeight: "800",
          lineHeight: "1.3",
          textAlign: "center",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: "3px",
          color: "#6B7280",
          fontSize: "0.7rem",
          textAlign: "center",
        }}
      >
        (İmza)
      </div>

      {/* STATİK ONAY DURUMLARI */}
      {showStatuses ? (
        <div
          style={{
            minHeight: "60px",
            marginTop: "12px",
            paddingLeft: "8px",
          }}
        >
          {APPROVAL_STATUSES.map((status) => (
            <StaticCheckbox key={status} label={status} />
          ))}
        </div>
      ) : (
        <div
          style={{
            minHeight: "60px",
            marginTop: "12px",
          }}
        />
      )}

      {/* İBT */}
      <div
        style={{
          marginTop: "auto",
          color: "#111827",
          fontSize: "0.75rem",
          fontWeight: "700",
        }}
      >
        İBT:{" "}
        <span
          style={{
            display: "inline-block",
            width: "75px",
            borderBottom: "1px dotted #111827",
          }}
        >
          &nbsp;
        </span>
      </div>
    </div>
  );
}

export default function PersonelTalepOnayImzalar() {
  return (
    <section
      style={{
        width: "100%",
        marginTop: "18px",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      {/* BÖLÜM BAŞLIĞI */}
      <div
        style={{
          marginBottom: "8px",
          padding: "8px 10px",
          borderBottom: "2px solid #E5E7EB",
          color: "#111827",
          fontSize: "1rem",
          fontWeight: "800",
          textTransform: "uppercase",
        }}
      >
        Onay ve İmzalar
      </div>

      {/* İMZA KARTLARI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "12px",
          alignItems: "stretch",
        }}
      >
        {SIGNATURE_ROLES.map((role) => (
          <SignatureCard
            key={role.key}
            title={role.title}
            showStatuses={role.showStatuses}
          />
        ))}
      </div>
    </section>
  );
}
