"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, FileCode } from "lucide-react";

interface CodeBlockProps {
  code: string;
  title?: string;
  filename?: string;
  language?: string;
  isTree?: boolean;
}

// Token categories for professional syntax highlighting (VS Code One Dark Standard)
const KEYWORDS = new Set([
  "export",
  "import",
  "from",
  "const",
  "let",
  "var",
  "function",
  "async",
  "await",
  "return",
  "type",
  "interface",
  "class",
  "extends",
  "implements",
  "if",
  "else",
  "throw",
  "new",
  "try",
  "catch",
  "finally",
  "typeof",
  "keyof",
  "as",
  "default",
  "case",
  "switch",
  "break",
  "continue",
  "in",
  "of",
]);

const BUILTIN_TYPES = new Set([
  "string",
  "number",
  "boolean",
  "any",
  "void",
  "never",
  "unknown",
  "null",
  "undefined",
  "Date",
  "Promise",
  "Array",
  "Record",
  "Object",
  "Set",
  "Map",
]);

export default function CodeBlock({
  code,
  title,
  filename,
  language = "typescript",
  isTree = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = code.trim().split("\n");

  // Tokenize a single line of code
  const highlightCodeLine = (line: string) => {
    // Check if line is purely a comment
    const trimmed = line.trim();
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*")
    ) {
      return <span className="text-[#64748b] italic">{line}</span>;
    }

    // Split inline comments: e.g. "code // comment"
    const commentMatch = line.match(/^([\s\S]*?)(\/\/.*)$/);
    let codePart = line;
    let commentPart: string | null = null;
    if (commentMatch) {
      codePart = commentMatch[1];
      commentPart = commentMatch[2];
    }

    // Tokenizer regex matching strings, numbers, keywords, function calls, property keys, punctuation
    const tokenRegex =
      /('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b(?:\d+(?:\.\d+)?)\b|\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()|\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*:)|[{}()\[\].,;:]|=>|[!=<>+\-*\/%&|^~?]+|[a-zA-Z_$][a-zA-Z0-9_$]*|\s+|[^\s\w{}()\[\].,;:=>!<>+\-*\/%&|^~?]+)/g;

    const tokens: React.ReactNode[] = [];
    let match;
    let index = 0;

    while ((match = tokenRegex.exec(codePart)) !== null) {
      const token = match[0];
      const key = `${index++}-${token}`;

      if (/^['"`]/.test(token)) {
        // String literal (soft emerald green)
        tokens.push(
          <span key={key} className="text-[#98c379]">
            {token}
          </span>,
        );
      } else if (/^\d/.test(token)) {
        // Number literal (warm orange/peach)
        tokens.push(
          <span key={key} className="text-[#d19a66]">
            {token}
          </span>,
        );
      } else if (KEYWORDS.has(token)) {
        // Keyword (vibrant purple/violet)
        tokens.push(
          <span key={key} className="text-[#c678dd] font-medium">
            {token}
          </span>,
        );
      } else if (BUILTIN_TYPES.has(token)) {
        // Built-in Type (golden yellow / cyan)
        tokens.push(
          <span key={key} className="text-[#e5c07b]">
            {token}
          </span>,
        );
      } else if (token === "z") {
        // Zod validation library instance (cyan highlight)
        tokens.push(
          <span key={key} className="text-[#38bdf8] font-semibold">
            {token}
          </span>,
        );
      } else if (/^[A-Z][a-zA-Z0-9_$]*$/.test(token)) {
        // PascalCase Class, Interface, or Model (e.g. SlotModel, ApiError, Conflict)
        tokens.push(
          <span key={key} className="text-[#e5c07b] font-medium">
            {token}
          </span>,
        );
      } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(token)) {
        // Check following character in codePart for function call or property key
        const nextCharIndex = tokenRegex.lastIndex;
        const remainder = codePart.slice(nextCharIndex);
        if (/^\s*\(/.test(remainder)) {
          // Function or method call (sky blue)
          tokens.push(
            <span key={key} className="text-[#61afef]">
              {token}
            </span>,
          );
        } else if (/^\s*:/.test(remainder)) {
          // Object property key (coral / crisp white)
          tokens.push(
            <span key={key} className="text-[#e06c75]">
              {token}
            </span>,
          );
        } else {
          // General identifier / variable
          tokens.push(
            <span key={key} className="text-[#abb2bf]">
              {token}
            </span>,
          );
        }
      } else if (/^[{}()\[\].,;:]$/.test(token)) {
        // Punctuation (muted slate)
        tokens.push(
          <span key={key} className="text-[#abb2bf]/70">
            {token}
          </span>,
        );
      } else if (/^[!=<>+\-*\/%&|^~?]+$/.test(token) || token === "=>") {
        // Operators (vibrant cyan/pink)
        tokens.push(
          <span key={key} className="text-[#56b6c2]">
            {token}
          </span>,
        );
      } else {
        // Whitespace or unrecognized
        tokens.push(<span key={key}>{token}</span>);
      }
    }

    return (
      <>
        {tokens}
        {commentPart && (
          <span className="text-[#64748b] italic">{commentPart}</span>
        )}
      </>
    );
  };

  // Format directory tree line (tree pipes, folders, files, comments)
  const highlightTreeLine = (line: string) => {
    const hashIndex = line.indexOf("#");
    let pathPart = line;
    let commentPart = "";

    if (hashIndex !== -1) {
      pathPart = line.slice(0, hashIndex);
      commentPart = line.slice(hashIndex);
    }

    // Split leading indentation / guides from name
    const match = pathPart.match(/^([\s│├──└──]*)(.*)$/);
    const guides = match ? match[1] : "";
    const name = match ? match[2].trimEnd() : pathPart;

    const isFolder = name.endsWith("/");
    const isFile = name.includes(".");

    return (
      <span className="flex items-center">
        <span className="text-[#475569] select-none">{guides}</span>
        <span
          className={
            isFolder
              ? "text-[#38bdf8] font-medium"
              : isFile
                ? "text-[#98c379]"
                : "text-neutral-200"
          }
        >
          {name}
        </span>
        {commentPart && (
          <span className="text-[#64748b] italic ml-2">{commentPart}</span>
        )}
      </span>
    );
  };

  return (
    <div className="rounded-2xl bg-[#080a0f] border border-white/[0.08] overflow-hidden shadow-2xl">
      {/* Code Window Header (macOS Terminal Aesthetic) */}
      <div className="px-4 py-2.5 bg-[#0f121a] border-b border-white/[0.06] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f56]" />
            <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-2.5 rounded-full bg-[#27c93f]" />
          </div>
          {(title || filename) && (
            <div className="flex items-center gap-1.5 ml-2">
              {isTree ? (
                <Terminal size={12} className="text-[#38bdf8]" />
              ) : (
                <FileCode size={12} className="text-[#e5c07b]" />
              )}
              <span className="font-mono text-[11px] text-neutral-300 font-medium">
                {title || filename}
              </span>
              {title && filename && (
                <span className="font-mono text-[10px] text-neutral-500">
                  {filename}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider hidden sm:inline-block">
            {isTree ? "Tree" : language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-mono text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check size={11} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body with Line Numbers Gutter (Scrollbar hidden) */}
      <div
        data-code-block="true"
        className="overflow-x-auto p-4 sm:p-5 font-mono text-xs leading-relaxed bg-[#080a0f] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                {/* Line Number Gutter */}
                <td className="w-8 pr-4 text-right select-none text-[11px] text-neutral-600 border-r border-white/[0.05] align-top">
                  {idx + 1}
                </td>
                {/* Syntax Highlighted Line */}
                <td className="pl-4 whitespace-pre font-mono align-top text-neutral-200">
                  {isTree ? highlightTreeLine(line) : highlightCodeLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
