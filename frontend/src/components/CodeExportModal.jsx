import { useEffect, useMemo, useRef, useState } from "react";

const PYTHON_KEYWORDS = new Set([
  "and",
  "as",
  "class",
  "def",
  "elif",
  "else",
  "except",
  "False",
  "for",
  "from",
  "if",
  "import",
  "in",
  "None",
  "not",
  "or",
  "raise",
  "return",
  "True",
  "try",
  "while",
]);

function highlightLine(line, lineIndex) {
  const regex =
    /#.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b/g;
  const tokens = [];
  let lastIndex = 0;
  let match;
  let tokenIndex = 0;

  while ((match = regex.exec(line)) !== null) {
    const [value] = match;
    const start = match.index;
    if (start > lastIndex) {
      tokens.push(
        <span key={`plain-${lineIndex}-${tokenIndex++}`}>
          {line.slice(lastIndex, start)}
        </span>,
      );
    }

    let color = "var(--text-strong)";
    if (value.startsWith("#")) color = "#6b7280";
    else if (value.startsWith('"') || value.startsWith("'")) color = "#7dd3fc";
    else if (/^\d/.test(value)) color = "#f9a8d4";
    else if (PYTHON_KEYWORDS.has(value)) color = "#fbbf24";
    else if (/^[A-Z_]{2,}$/.test(value)) color = "#c4b5fd";
    else if (value.includes("fusion") || value.includes("BeliefMass"))
      color = "#86efac";
    else color = "#cbd5e1";

    tokens.push(
      <span key={`tok-${lineIndex}-${tokenIndex++}`} style={{ color }}>
        {value}
      </span>,
    );
    lastIndex = start + value.length;
  }

  if (lastIndex < line.length) {
    tokens.push(<span key={`tail-${lineIndex}`}>{line.slice(lastIndex)}</span>);
  }

  return tokens;
}

function CodeExportModal({
  open,
  loading,
  error,
  code,
  filename,
  datasetKind,
  copySuccess,
  onCopy,
  onClose,
  t,
}) {
  const [setupCopied, setSetupCopied] = useState(false);
  const dialogRef = useRef(null);

  const setupCommand = useMemo(() => {
    if (datasetKind === "calculator") return "pip install evidencelib";
    return "pip install evidencelib numpy scikit-learn";
  }, [datasetKind]);

  useEffect(() => {
    if (!open) return;

    const focusTimer = window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [open]);

  const copySetup = async () => {
    try {
      await navigator.clipboard.writeText(setupCommand);
      setSetupCopied(true);
      window.setTimeout(() => setSetupCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="code-export-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border shadow-2xl outline-none"
        style={{ borderColor: "var(--line)", background: "var(--bg-elevated)" }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--line)", background: "var(--bg-sunken)" }}
        >
          <div>
            <p
              id="code-export-title"
              className="text-sm font-semibold"
              style={{ color: "var(--text-strong)" }}
            >
              {t("ml.export.title")}
            </p>
            <p
              className="mt-1 text-xs leading-5"
              style={{ color: "var(--text-muted)" }}
            >
              {datasetKind === "uploaded"
                ? t("ml.export.csvHint")
                : t("ml.export.readyHint")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary text-xs"
          >
            {t("ml.export.close")}
          </button>
        </div>

        <div className="max-h-[calc(90vh-6rem)] overflow-auto">
          {loading && (
            <div
              className="px-5 py-6 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              {t("ml.export.loading")}
            </div>
          )}
          {!loading && error && (
            <div
              className="px-5 py-6 text-sm"
              style={{ color: "var(--danger)" }}
            >
              {t("ml.export.error")}: {error}
            </div>
          )}
          {!loading && !error && code && (
            <div className="space-y-5 p-5">
              {/* Requirements */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-strong)" }}
                  >
                    {t("ml.export.requirementsTitle")}
                  </span>
                  <button
                    type="button"
                    onClick={copySetup}
                    className="btn btn-secondary text-xs"
                  >
                    {setupCopied ? t("ml.export.copied") : t("ml.export.copy")}
                  </button>
                </div>
                <pre
                  className="overflow-x-auto rounded-lg border px-4 py-3 text-[13px] leading-6"
                  style={{
                    borderColor: "var(--line)",
                    background:
                      "linear-gradient(180deg, #08111d 0%, #0f172a 100%)",
                    color: "#e2e8f0",
                  }}
                >
                  <code className="whitespace-pre">{setupCommand}</code>
                </pre>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t("ml.export.setupHint")}
                </p>
              </div>

              {/* Script */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-strong)" }}
                  >
                    {filename || t("ml.export.scriptTitle")}
                  </span>
                  <button
                    type="button"
                    onClick={onCopy}
                    disabled={!code || loading}
                    className="btn btn-secondary text-xs"
                  >
                    {copySuccess ? t("ml.export.copied") : t("ml.export.copy")}
                  </button>
                </div>
                <pre
                  className="overflow-x-auto rounded-lg border px-4 py-3 text-[13px] leading-6"
                  style={{
                    borderColor: "var(--line)",
                    background:
                      "linear-gradient(180deg, #08111d 0%, #0f172a 100%)",
                    color: "#e2e8f0",
                  }}
                >
                  <code>
                    {code.split("\n").map((line, index) => (
                      <div key={`line-${index}`} className="whitespace-pre">
                        {highlightLine(line, index)}
                      </div>
                    ))}
                  </code>
                </pre>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {datasetKind === "uploaded"
                    ? t("ml.export.runUploadedHint")
                    : t("ml.export.runHint")}{" "}
                  <span
                    className="mono"
                    style={{ color: "var(--text-strong)" }}
                  >
                    python {filename || "script.py"}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CodeExportModal;
