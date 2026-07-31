import { useRef, useState } from "react";
import Button from "../common/Button";
import Icon from "../ui/Icon";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ResumeUpload({ file, onFileChange, onAnalyze, onSample, pending }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  const chooseFile = (candidate) => {
    setFileError("");
    if (!candidate) return;
    if (candidate.type !== "application/pdf" && !candidate.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Choose a PDF resume.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setFileError("The PDF must be 5 MB or smaller.");
      return;
    }
    onFileChange(candidate);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="rounded-lg border border-rapido-line bg-white p-5 shadow-premium sm:p-7">
      <div
        className={`flex min-h-56 flex-col items-center justify-center rounded-lg border-2 border-dashed px-5 py-8 text-center transition ${
          dragging ? "border-rapido-blue bg-blue-50" : "border-blue-200 bg-rapido-mist"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <span className="grid h-14 w-14 place-items-center rounded-lg bg-white text-rapido-blue shadow-sm">
          <Icon name={file ? "FiCheckCircle" : "FiUploadCloud"} className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold text-rapido-navy">
          {file ? file.name : "Upload your resume"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-rapido-slate">
          {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB PDF selected` : "Drop a text-based PDF here or choose one from your device."}
        </p>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => chooseFile(event.target.files?.[0])}
          aria-label="Choose a PDF resume"
        />
        <Button className="mt-5" variant="secondary" size="sm" icon="FiUploadCloud" onClick={() => inputRef.current?.click()}>
          Choose PDF
        </Button>
      </div>
      {fileError ? <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-700"><Icon name="FiAlertCircle" />{fileError}</p> : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button onClick={onAnalyze} disabled={!file || pending} icon="FiSearch">
          {pending ? "Analyzing Resume..." : "Analyze Resume"}
        </Button>
        <Button onClick={onSample} disabled={pending} variant="secondary" icon="FiFileText">
          Try Sample Resume
        </Button>
      </div>
    </div>
  );
}
