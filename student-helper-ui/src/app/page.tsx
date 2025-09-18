"use client";
import { useState, useRef, useEffect } from "react";

// SafeButton stays the same
function SafeButton({ children, className, onClick }: any) {
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      suppressHydrationWarning
    >
      {children}
    </button>
  );
}

// Helper: count words
function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

// Auto-resizing textarea component with word counter
function AutoTextarea({
  value,
  onChange,
  placeholder,
  maxWords = 1000,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  maxWords?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const words = countWords(value);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  // Pick color dynamically
  let counterColor = "text-gray-500";
  if (words >= maxWords) {
    counterColor = "text-red-600 font-bold";
  } else if (words >= maxWords - 100) {
    counterColor = "text-orange-500 font-semibold";
  }

  return (
    <div>
      <textarea
        ref={textareaRef}
        rows={3}
        className="w-full border border-gray-300 rounded-lg p-3 mb-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        value={value}
        onChange={(e) => {
          if (countWords(e.target.value) <= maxWords) {
            onChange(e.target.value);
          }
        }}
        placeholder={placeholder}
      />
      <div className={`text-right text-sm ${counterColor} mb-2`}>
        {words}/{maxWords} words
      </div>
    </div>
  );
}


export default function Home() {
  const [styleText, setStyleText] = useState("");
  const [grammarText, setGrammarText] = useState("");
  const [word, setWord] = useState("");
  const [output, setOutput] = useState<any>(null);
  const [mode, setMode] = useState("");

  async function callAPI(path: string, body: any, label: string) {
    setMode(label);
    setOutput("⏳ Waiting for server...");
    try {
      const res = await fetch(`http://localhost:8000${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setOutput(data);
    } catch (err) {
      setOutput("❌ Could not reach backend. Is FastAPI running?");
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-700">
        📝 Student Writing Helper
      </h1>

      {/* -------- Style Coach -------- */}
      <section className="mb-10 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-3">1) Style Coach</h2>
        <AutoTextarea
          value={styleText}
          onChange={setStyleText}
          placeholder="Paste up to 1000 words..."
        />
        <SafeButton
          onClick={() => callAPI("/api/style", { text: styleText }, "style")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md"
        >
          ✨ Improve Style
        </SafeButton>
      </section>

      {/* -------- Grammar Checker -------- */}
      <section className="mb-10 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-3">2) Grammar Checker</h2>
        <AutoTextarea
          value={grammarText}
          onChange={setGrammarText}
          placeholder="Paste up to 1000 words..."
        />
        <SafeButton
          onClick={() =>
            callAPI("/api/grammar", { text: grammarText }, "grammar")
          }
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md"
        >
          🛠 Check Grammar
        </SafeButton>
      </section>

      {/* -------- Define a Word -------- */}
      <section className="mb-10 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-3">3) Define a Word</h2>
        <div className="flex gap-3">
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a word..."
            className="flex-1 border border-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <SafeButton
            onClick={() => callAPI("/api/define", { word }, "define")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 shadow-md"
          >
            📖 Define
          </SafeButton>
        </div>
      </section>

      {/* -------- Output -------- */}
      {/* -------- Output -------- */}
<section className="bg-gray-50 rounded-lg shadow-inner p-6">
  <h2 className="text-2xl font-semibold mb-4">Results</h2>
  <div className="bg-white shadow-md rounded-lg p-5">
    {typeof output === "string" ? (
      <pre className="whitespace-pre-wrap">{output}</pre>
    ) : output && mode === "grammar" ? (
      <div>
        <p className="mb-2">
          <strong>Corrected Text:</strong>{" "}
          {output.corrected_text || "No corrected text provided."}
        </p>
        <p className="mb-4">
          <strong>Score:</strong> {output.score}
        </p>
        {output.issues && output.issues.length > 0 ? (
          <table className="table-auto border-collapse w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Issue</th>
                <th className="border p-2">Before</th>
                <th className="border p-2">After</th>
              </tr>
            </thead>
            <tbody>
              {output.issues.map((i: any, idx: number) => (
                <tr key={idx}>
                  <td className="border p-2">{i.message}</td>
                  <td className="border p-2 text-red-600">{i.before}</td>
                  <td className="border p-2 text-green-600">{i.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No issues found 🎉</p>
        )}
      </div>
    ) : output && mode === "define" ? (
      <div className="p-4 border rounded-lg bg-purple-50">
        <h3 className="text-lg font-bold mb-2">{output.word}</h3>
        <p>
          <strong>Part of Speech:</strong> {output.part_of_speech}
        </p>
        <p>
          <strong>Definition:</strong> {output.definition}
        </p>
        <p>
          <strong>Example:</strong> {output.example}
        </p>
        <p>
          <strong>Level:</strong> {output.level}
        </p>
        <p>
          <strong>Synonyms:</strong> {output.synonyms?.join(", ")}
        </p>
      </div>
    ) : output && mode === "style" ? (
      <div className="p-4 border rounded-lg bg-blue-50">
        <p className="mb-2">
          <strong>Overall:</strong> {output.overall}
        </p>
        <p className="mb-2">
          <strong>Readability Level:</strong> {output.readability_level}
        </p>
        <ul className="list-disc ml-6 mt-2">
          {output.high_level_suggestions?.map((s: string, idx: number) => (
            <li key={idx}>{s}</li>
          ))}
        </ul>
      </div>
    ) : (
      <p className="text-gray-500">No results yet.</p>
    )}
  </div>
</section>
    </main>
  );
}
