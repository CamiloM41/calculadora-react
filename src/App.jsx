import { useState } from "react";

// Paleta: fondo pizarra profundo, superficie de teclas en carbón cálido,
// acento en ámbar eléctrico reservado solo para el operador activo y "=".
const COLORS = {
  bg: "#14171A",
  surface: "#1D2124",
  key: "#24282C",
  keyHover: "#2C3136",
  amber: "#E8A33D",
  amberDim: "#4A3A1E",
  textPrimary: "#F2EFE9",
  textMuted: "#7A8087",
  divider: "#2A2E32",
};

function formatDisplay(value) {
  if (value === "Error") return value;
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  const [intPart, decPart] = value.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

function compute(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  switch (op) {
    case "+":
      return x + y;
    case "-":
      return x - y;
    case "×":
      return x * y;
    case "÷":
      return y === 0 ? NaN : x / y;
    default:
      return y;
  }
}

export default function App() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(true);
  const [expression, setExpression] = useState("");

  const inputDigit = (digit) => {
    if (display === "Error") {
      setDisplay(digit);
      setOverwrite(false);
      return;
    }
    if (overwrite) {
      setDisplay(digit === "." ? "0." : digit);
      setOverwrite(false);
    } else {
      if (digit === "." && display.includes(".")) return;
      if (display.replace("-", "").replace(".", "").length >= 12) return;
      setDisplay(display + digit);
    }
  };

  const chooseOperator = (op) => {
    if (display === "Error") return;
    if (operator && !overwrite) {
      const result = compute(stored, display, operator);
      const resultStr = Number.isNaN(result) ? "Error" : trimResult(result);
      setStored(resultStr);
      setDisplay(resultStr);
      setExpression(`${resultStr} ${op}`);
    } else {
      setStored(display);
      setExpression(`${display} ${op}`);
    }
    setOperator(op);
    setOverwrite(true);
  };

  const trimResult = (num) => {
    if (!Number.isFinite(num)) return "Error";
    let str = String(Math.round(num * 1e10) / 1e10);
    if (str.replace("-", "").replace(".", "").length > 12) {
      str = num.toExponential(6);
    }
    return str;
  };

  const equals = () => {
    if (operator === null || display === "Error") return;
    const result = compute(stored, display, operator);
    const resultStr = Number.isNaN(result) ? "Error" : trimResult(result);
    setExpression(`${stored} ${operator} ${display} =`);
    setDisplay(resultStr);
    setStored(null);
    setOperator(null);
    setOverwrite(true);
  };

  const clearAll = () => {
    setDisplay("0");
    setStored(null);
    setOperator(null);
    setOverwrite(true);
    setExpression("");
  };

  const toggleSign = () => {
    if (display === "0" || display === "Error") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  };

  const percent = () => {
    if (display === "Error") return;
    const val = parseFloat(display) / 100;
    setDisplay(trimResult(val));
    setOverwrite(true);
  };

  const backspace = () => {
    if (display === "Error" || overwrite) return;
    if (display.length <= 1 || (display.length === 2 && display.startsWith("-"))) {
      setDisplay("0");
      setOverwrite(true);
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const Key = ({ label, onClick, variant = "default", span }) => {
    const base = {
      border: "none",
      borderRadius: 14,
      fontSize: label === "0" ? 22 : 20,
      fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: 500,
      cursor: "pointer",
      height: 62,
      gridColumn: span ? "span 2" : undefined,
      transition: "background-color 120ms ease, transform 80ms ease",
      display: "flex",
      alignItems: "center",
      justifyContent: span ? "flex-start" : "center",
      paddingLeft: span ? 24 : 0,
    };
    const variants = {
      default: { background: COLORS.key, color: COLORS.textPrimary },
      muted: { background: COLORS.surface, color: COLORS.textMuted },
      operator:
        operator === label
          ? { background: COLORS.amber, color: "#1A1502" }
          : { background: COLORS.amberDim, color: COLORS.amber },
      equals: { background: COLORS.amber, color: "#1A1502", fontWeight: 600 },
    };
    return (
      <button
        onClick={onClick}
        style={{ ...base, ...variants[variant] }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseEnter={(e) => {
          if (variant === "default") e.currentTarget.style.background = COLORS.keyHover;
        }}
        onMouseOut={(e) => {
          if (variant === "default") e.currentTarget.style.background = COLORS.key;
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <div
        style={{
          width: 340,
          background: COLORS.surface,
          borderRadius: 28,
          padding: 20,
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
          border: `1px solid ${COLORS.divider}`,
        }}
      >
        {/* Pantalla */}
        <div
          style={{
            padding: "28px 16px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
            minHeight: 110,
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              color: COLORS.textMuted,
              fontSize: 13,
              letterSpacing: 0.5,
              minHeight: 16,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {expression || "\u00A0"}
          </div>
          <div
            style={{
              color: display === "Error" ? "#E8623D" : COLORS.textPrimary,
              fontSize: display.length > 8 ? 36 : 48,
              fontWeight: 300,
              lineHeight: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {formatDisplay(display)}
          </div>
        </div>

        <div style={{ height: 1, background: COLORS.divider, margin: "4px 0 16px" }} />

        {/* Teclado */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
          <Key label="AC" onClick={clearAll} variant="muted" />
          <Key label="±" onClick={toggleSign} variant="muted" />
          <Key label="%" onClick={percent} variant="muted" />
          <Key label="÷" onClick={() => chooseOperator("÷")} variant="operator" />

          <Key label="7" onClick={() => inputDigit("7")} />
          <Key label="8" onClick={() => inputDigit("8")} />
          <Key label="9" onClick={() => inputDigit("9")} />
          <Key label="×" onClick={() => chooseOperator("×")} variant="operator" />

          <Key label="4" onClick={() => inputDigit("4")} />
          <Key label="5" onClick={() => inputDigit("5")} />
          <Key label="6" onClick={() => inputDigit("6")} />
          <Key label="-" onClick={() => chooseOperator("-")} variant="operator" />

          <Key label="1" onClick={() => inputDigit("1")} />
          <Key label="2" onClick={() => inputDigit("2")} />
          <Key label="3" onClick={() => inputDigit("3")} />
          <Key label="+" onClick={() => chooseOperator("+")} variant="operator" />

          <Key label="0" onClick={() => inputDigit("0")} span />
          <Key label="." onClick={() => inputDigit(".")} />
          <Key label="=" onClick={equals} variant="equals" />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 14,
          }}
        >
          <button
            onClick={backspace}
            style={{
              background: "transparent",
              border: "none",
              color: COLORS.textMuted,
              fontSize: 12,
              letterSpacing: 1,
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            ⌫ borrar
          </button>
        </div>
      </div>
    </div>
  );
}