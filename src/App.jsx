import { useState } from "react";

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

function trimResult(num) {
  if (!Number.isFinite(num)) return "Error";
  let str = String(Math.round(num * 1e10) / 1e10);
  if (str.replace("-", "").replace(".", "").length > 12) {
    str = num.toExponential(6);
  }
  return str;
}

const Key = ({ label, onClick, variant = "default", span, isActive }) => {
  const base = {
    border: "none",
    borderRadius: 14,
    fontSize: label === "0" ? 22 : 20,
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 500,
    cursor: "pointer",
    height: 62,
    gridColumn: span ? "span 2" : undefined,
    transition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: span ? "flex-start" : "center",
    paddingLeft: span ? 24 : 0,
    outline: "none",
    position: "relative",
    overflow: "hidden",
  };

  const variants = {
    default: {
      background: COLORS.key,
      color: COLORS.textPrimary,
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    },
    muted: {
      background: COLORS.surface,
      color: COLORS.textMuted,
      boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
    },
    operator: isActive
      ? {
          background: COLORS.amber,
          color: "#1A1502",
          boxShadow: `0 4px 12px rgba(232, 163, 61, 0.4)`,
          transform: "scale(1.02)",
        }
      : {
          background: COLORS.amberDim,
          color: COLORS.amber,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        },
    equals: {
      background: COLORS.amber,
      color: "#1A1502",
      fontWeight: 600,
      boxShadow: "0 4px 12px rgba(232, 163, 61, 0.3)",
    },
  };

  const handleMouseDown = (e) => {
    e.currentTarget.style.transform = "scale(0.94)";
    e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.3)";
  };

  const handleMouseUp = (e) => {
    const finalTransform = variant === "operator" && isActive ? "scale(1.02)" : "scale(1)";
    e.currentTarget.style.transform = finalTransform;
    const finalShadow =
      variant === "operator" && isActive
        ? "0 4px 12px rgba(232, 163, 61, 0.4)"
        : variants[variant].boxShadow;
    e.currentTarget.style.boxShadow = finalShadow;
  };

  const handleMouseEnter = (e) => {
    if (variant === "default") {
      e.currentTarget.style.background = COLORS.keyHover;
      e.currentTarget.style.transform = "scale(1.04)";
      e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
    }
  };

  const handleMouseLeave = (e) => {
    if (variant === "default") {
      e.currentTarget.style.background = COLORS.key;
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
    }
  };

  const ariaLabel =
    label === "÷"
      ? "dividir"
      : label === "×"
        ? "multiplicar"
        : label === "-"
          ? "restar"
          : label === "+"
            ? "sumar"
            : label === "="
              ? "igual"
              : label === "±"
                ? "cambiar signo"
                : label === "%"
                  ? "porcentaje"
                  : label === "AC"
                    ? "borrar todo"
                    : label === "."
                      ? "punto decimal"
                      : label;

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ ...base, ...variants[variant] }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {label}
    </button>
  );
};

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

  return (
    <div
      style={{
        minHeight: "100svh",
        background: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          background: COLORS.surface,
          borderRadius: 28,
          padding: 20,
          boxShadow:
            "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
          border: `1px solid ${COLORS.divider}`,
          animation: "fadeIn 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

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
            key={expression}
            style={{
              color: COLORS.textMuted,
              fontSize: 13,
              letterSpacing: 0.5,
              minHeight: 16,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              animation: expression ? "slideDown 200ms ease-out" : "none",
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
              transition: "font-size 200ms cubic-bezier(0.4, 0, 0.2, 1), color 200ms ease",
            }}
          >
            {formatDisplay(display)}
          </div>
        </div>

        <div style={{ height: 1, background: COLORS.divider, margin: "4px 0 16px" }} />

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
          <Key
            label="÷"
            onClick={() => chooseOperator("÷")}
            variant="operator"
            isActive={operator === "÷"}
          />

          <Key label="7" onClick={() => inputDigit("7")} />
          <Key label="8" onClick={() => inputDigit("8")} />
          <Key label="9" onClick={() => inputDigit("9")} />
          <Key
            label="×"
            onClick={() => chooseOperator("×")}
            variant="operator"
            isActive={operator === "×"}
          />

          <Key label="4" onClick={() => inputDigit("4")} />
          <Key label="5" onClick={() => inputDigit("5")} />
          <Key label="6" onClick={() => inputDigit("6")} />
          <Key
            label="-"
            onClick={() => chooseOperator("-")}
            variant="operator"
            isActive={operator === "-"}
          />

          <Key label="1" onClick={() => inputDigit("1")} />
          <Key label="2" onClick={() => inputDigit("2")} />
          <Key label="3" onClick={() => inputDigit("3")} />
          <Key
            label="+"
            onClick={() => chooseOperator("+")}
            variant="operator"
            isActive={operator === "+"}
          />

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
            aria-label="borrar último dígito"
            style={{
              background: "transparent",
              border: "none",
              color: COLORS.textMuted,
              fontSize: 12,
              letterSpacing: 1,
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace",
              padding: "4px 8px",
              borderRadius: 6,
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = COLORS.textPrimary;
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = COLORS.textMuted;
              e.currentTarget.style.background = "transparent";
            }}
          >
            ⌫ borrar
          </button>
        </div>
      </div>
    </div>
  );
}
