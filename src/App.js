import React, { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  LockOpen,
  Upload,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Download,
  Shield,
  Key,
  X,
  Instagram,
  Github,
  Linkedin,
  Mail,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

// ─── Status enum ────────────────────────────────────────────────────────────
const STATUS = {
  IDLE: 'idle',
  READY: 'ready',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
  NO_PROTECTION: 'no_protection',
};

// ─── Format bytes ────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}



// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [unlockedBlob, setUnlockedBlob] = useState(null);
  const [unlockedFileName, setUnlockedFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // ── File validation ────────────────────────────────────────────────────────
  const validateFile = (f) => {
    if (!f) return 'No file selected.';
    const ext = f.name.split('.').pop().toLowerCase();
    if (ext === 'ppt')
      return 'Old-format .ppt files are not supported. Please re-save it as .pptx in PowerPoint first.';
    if (ext !== 'pptx')
      return `Unsupported file type ".${ext}". Only .pptx files are accepted.`;
    return null;
  };

  // ── Accept a file ─────────────────────────────────────────────────────────
  const acceptFile = useCallback((f) => {
    const err = validateFile(f);
    if (err) {
      setStatus(STATUS.ERROR);
      setMessage(err);
      setFile(null);
      return;
    }
    setFile(f);
    setStatus(STATUS.READY);
    setMessage('');
    setUnlockedBlob(null);
  }, []);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const onDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files[0]);
  }, [acceptFile]);
  const onFileInputChange = useCallback((e) => {
    acceptFile(e.target.files[0]);
    e.target.value = '';
  }, [acceptFile]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = () => {
    setFile(null);
    setStatus(STATUS.IDLE);
    setMessage('');
    setUnlockedBlob(null);
    setProgress(0);
  };

  // ── Core unlock logic ──────────────────────────────────────────────────────
  const handleUnlock = async () => {
    if (!file) return;
    setStatus(STATUS.PROCESSING);
    setProgress(0);

    try {
      setProgress(15);
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read the file.'));
        reader.readAsArrayBuffer(file);
      });

      setProgress(35);
      const zip = await JSZip.loadAsync(arrayBuffer);

      setProgress(55);
      const presentationFile = zip.file('ppt/presentation.xml');
      if (!presentationFile) {
        setStatus(STATUS.ERROR);
        setMessage('Could not locate "ppt/presentation.xml". The file may be corrupted or is not a valid PowerPoint archive.');
        return;
      }

      const xmlString = await presentationFile.async('string');

      setProgress(70);
      const modifyVerifierRegex = /<p:modifyVerifier[^>]*\/>/g;
      if (!modifyVerifierRegex.test(xmlString)) {
        setStatus(STATUS.NO_PROTECTION);
        setMessage('No write-protection tag was found. This presentation may already be editable, or it uses full-encryption (Open Password) which cannot be removed here.');
        return;
      }

      const modifiedXml = xmlString.replace(/<p:modifyVerifier[^>]*\/>/g, '');

      setProgress(80);
      zip.file('ppt/presentation.xml', modifiedXml);

      setProgress(90);
      const blob = await zip.generateAsync(
        { type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
        (meta) => setProgress(90 + Math.round(meta.percent / 10))
      );

      const newName = `${file.name.replace(/\.pptx$/i, '')}_unlocked.pptx`;
      setUnlockedBlob(blob);
      setUnlockedFileName(newName);
      setProgress(100);
      setStatus(STATUS.SUCCESS);
      setMessage('Done! Write-protection has been stripped. Your file is ready to download.');
    } catch (err) {
      console.error(err);
      setStatus(STATUS.ERROR);
      setMessage(`Processing failed: ${err.message || 'Unknown error'}. Ensure the file is a valid, unencrypted .pptx.`);
    }
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (unlockedBlob) saveAs(unlockedBlob, unlockedFileName);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-obsidian relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="fixed inset-0 bg-spotlight pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-50" />
      
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header className="nav-glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-sapphire-500/20 to-amethyst-500/20 rounded-xl border border-sapphire-500/20 shadow-glow-sapphire/20">
              <Key size={22} className="text-sapphire-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">
              <span className="text-text-primary">Slide</span>
              <span className="text-sapphire-400">Unlocker</span>
            </span>
          </div>
          <div className="glow-badge text-[10px] sm:text-xs py-1.5 sm:py-2">
            <span className="text-emerald-300 hidden sm:inline">All processing is local</span>
            <span className="text-emerald-300 sm:hidden">Local only</span>
          </div>
        </div>
      </header>

      {/* ── TWO-COLUMN HERO + TOOL ───────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-14 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">

        {/* LEFT – Copy */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-sapphire-500/10 border border-sapphire-500/20 rounded-full px-4 py-2 text-xs text-sapphire-300 font-semibold uppercase tracking-widest hover:bg-sapphire-500/15 transition-colors cursor-default">
            <Shield size={12} className="text-sapphire-400" />
            Zero-Upload Guarantee
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-text-primary leading-[1.15] sm:leading-[1.1] tracking-tight">
            Remove PowerPoint
            <br />
            <span className="text-sapphire-400">
              Edit Restrictions
            </span>
            <br />
            <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-text-muted">in one click.</span>
          </h1>

          <p className="text-base text-text-secondary leading-relaxed max-w-md">
            Upload your <code className="bg-sapphire-500/15 text-sapphire-300 px-2 py-0.5 rounded font-semibold text-sm">.pptx</code> file
            and get an editable version back instantly —
            <strong className="text-text-primary"> 100% private, no sign-up, no waiting</strong>.
          </p>



          {/* Limitation note */}
          <div className="flex items-start gap-3 bg-amethyst-500/10 border border-amethyst-500/20 rounded-xl px-4 py-3.5 text-sm max-w-md backdrop-blur-sm">
            <AlertCircle size={16} className="flex-shrink-0 text-amethyst-400 mt-0.5" />
            <span className="text-amethyst-300/90 leading-relaxed">
              Works for <strong className="text-amethyst-200">"Password to Modify"</strong> restrictions only.
              Full-file encryption (Open Password) cannot be removed this way.
            </span>
          </div>
        </div>

        {/* RIGHT – Tool card */}
        <div className="flex flex-col gap-4">

            {/* Drop Zone */}
          <div
            id="drop-zone"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => status !== STATUS.PROCESSING && fileInputRef.current?.click()}
            className={`
              drop-zone py-8 sm:py-12 px-4 sm:px-8
              ${isDragging ? 'drop-zone-drag' : ''}
              ${(status === STATUS.READY || status === STATUS.SUCCESS) ? 'border-sapphire-500/30' : ''}
              ${status === STATUS.PROCESSING ? 'pointer-events-none opacity-80' : ''}
            `}
          >
            {isDragging && (
              <div className="absolute inset-0 rounded-2xl bg-sapphire-500/10 animate-pulse pointer-events-none" />
            )}

            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-sapphire-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amethyst-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* IDLE */}
            {(status === STATUS.IDLE || status === STATUS.ERROR) && (
              <>
                <div className={`p-5 rounded-2xl bg-gradient-to-br from-sapphire-500/20 to-amethyst-500/10 border border-sapphire-500/20 transition-all duration-300 ${isDragging ? 'scale-110 shadow-glow-sapphire' : ''}`}>
                  <Upload size={36} className="text-sapphire-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-text-primary">
                    Drop your <code className="text-sapphire-400">.pptx</code> here
                  </p>
                  <p className="text-text-muted mt-2 text-sm">or tap to pick a file from your device</p>
                </div>
              </>
            )}

            {/* READY */}
            {status === STATUS.READY && (
              <>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
                  <FileCheck2 size={36} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-text-primary break-all">{file?.name}</p>
                  <p className="text-text-muted text-sm mt-2">{formatBytes(file?.size)} · Tap to swap file</p>
                </div>
              </>
            )}

            {/* PROCESSING */}
            {status === STATUS.PROCESSING && (
              <>
                <div className="p-5 rounded-2xl bg-sapphire-500/15 border border-sapphire-500/20">
                  <div className="spinner" />
                </div>
                <p className="text-base font-semibold text-text-primary">Stripping protection…</p>
                <p className="text-text-muted text-sm truncate max-w-[200px]">{file?.name}</p>
                <div className="w-full max-w-[220px] bg-graphite rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sapphire-500 to-sapphire-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-sapphire-400 font-medium">{progress}%</p>
              </>
            )}

            {/* SUCCESS */}
            {status === STATUS.SUCCESS && (
              <>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 shadow-glow-emerald/30">
                  <CheckCircle2 size={36} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-emerald-300">Protection removed!</p>
                  <p className="text-text-muted text-sm mt-2 truncate max-w-[220px]">{unlockedFileName}</p>
                </div>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx"
            className="hidden"
            onChange={onFileInputChange}
            id="file-input"
          />

          {/* ── ALERT BANNERS ──────────────────────────────────────────── */}
          {status === STATUS.ERROR && (
            <div className="alert-error animate-fade-in">
              <AlertCircle size={16} className="flex-shrink-0 text-burgundy-400 mt-0.5" />
              <span className="flex-1 leading-relaxed">{message}</span>
              <button onClick={reset} className="text-burgundy-400/60 hover:text-burgundy-300 transition-colors">
                <X size={15} />
              </button>
            </div>
          )}

          {status === STATUS.NO_PROTECTION && (
            <div className="alert-warning animate-fade-in">
              <AlertCircle size={16} className="flex-shrink-0 text-amber-400 mt-0.5" />
              <span className="flex-1 leading-relaxed">{message}</span>
              <button onClick={reset} className="text-amber-400/60 hover:text-amber-300 transition-colors">
                <X size={15} />
              </button>
            </div>
          )}

          {status === STATUS.SUCCESS && (
            <div className="alert-success animate-fade-in">
              <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-400 mt-0.5" />
              <span className="flex-1 leading-relaxed">{message}</span>
            </div>
          )}

          {/* ── ACTION BUTTONS ─────────────────────────────────────────── */}
          {status === STATUS.READY && (
            <button
              id="strip-btn"
              onClick={handleUnlock}
              className="btn-primary flex items-center justify-center gap-2 text-base w-full group"
            >
              <LockOpen size={18} className="group-hover:scale-110 transition-transform" />
              Unlock Presentation
              <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </button>
          )}

          {status === STATUS.SUCCESS && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="save-btn"
                onClick={handleDownload}
                className="btn-success flex items-center justify-center gap-2 text-sm flex-1 group"
              >
                <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                Save Unlocked File
              </button>
              <button
                onClick={reset}
                className="btn-secondary flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm"
              >
                <Upload size={15} />
                New File
              </button>
            </div>
          )}

          {(status === STATUS.ERROR || status === STATUS.NO_PROTECTION) && (
            <button
              onClick={reset}
              className="btn-primary flex items-center justify-center gap-2 text-sm w-full"
            >
              <Upload size={16} />
              Pick a Different File
            </button>
          )}

          {/* Privacy micro-note */}
          <p className="text-center text-[11px] text-text-muted/50 leading-relaxed">
            🔐 Your file is never uploaded. All work happens in your browser memory.
          </p>
        </div>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="w-full bg-charcoal border-t border-white/5 relative z-10">
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sapphire-500/30 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">

          {/* Col 1 – Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-graphite/80 rounded-xl border border-white/5">
                <Key size={18} className="text-sapphire-400" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-text-primary">Slide</span>
                <span className="text-sapphire-400">Unlocker</span>
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed max-w-[220px]">
              A free, privacy-first tool to remove PowerPoint write-protection directly in your browser.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2 mt-2">
              <a
                href="https://www.instagram.com/hemang.joshi_"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2.5 bg-graphite/80 rounded-lg border border-white/5 hover:border-sapphire-500/30 hover:bg-sapphire-500/10 transition-all duration-200 group"
              >
                <Instagram size={16} className="text-text-muted group-hover:text-sapphire-400 transition-colors" />
              </a>
              <a
                href="https://github.com/hemangjoshi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2.5 bg-graphite/80 rounded-lg border border-white/5 hover:border-sapphire-500/30 hover:bg-sapphire-500/10 transition-all duration-200 group"
              >
                <Github size={16} className="text-text-muted group-hover:text-sapphire-400 transition-colors" />
              </a>
              <a
                href="https://www.linkedin.com/in/hemang-joshi-097849328/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2.5 bg-graphite/80 rounded-lg border border-white/5 hover:border-sapphire-500/30 hover:bg-sapphire-500/10 transition-all duration-200 group"
              >
                <Linkedin size={16} className="text-text-muted group-hover:text-sapphire-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Col 2 – Quick info */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted/70 mb-1">About the Tool</h3>
            {[
              'Removes "Password to Modify" only',
              'Does not remove Open Password encryption',
              'Supports .pptx (Office 2007+)',
              'No account or sign-up required',
              'Works offline after page load',
            ].map((item) => (
              <p key={item} className="text-sm text-text-muted/80 flex items-start gap-2 leading-snug">
                <span className="text-sapphire-400 mt-0.5 flex-shrink-0">›</span>
                {item}
              </p>
            ))}
          </div>

          {/* Col 3 – Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted/70 mb-1">Get in Touch</h3>
            <a
              href="https://www.instagram.com/hemang.joshi_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-text-muted/80 hover:text-sapphire-400 transition-colors group"
            >
              <span className="p-1.5 bg-graphite/80 rounded-lg group-hover:bg-sapphire-500/10 transition-all border border-white/5 group-hover:border-sapphire-500/20">
                <Instagram size={13} />
              </span>
              instagram.com/hemang.joshi_
            </a>
            <a
              href="https://github.com/hemangjoshi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-text-muted/80 hover:text-sapphire-400 transition-colors group"
            >
              <span className="p-1.5 bg-graphite/80 rounded-lg group-hover:bg-sapphire-500/10 transition-all border border-white/5 group-hover:border-sapphire-500/20">
                <Github size={13} />
              </span>
              github.com/hemangjoshi
            </a>
            <a
              href="mailto:hemangjoshi984@gmail.com"
              className="flex items-center gap-3 text-sm text-text-muted/80 hover:text-sapphire-400 transition-colors group"
            >
              <span className="p-1.5 bg-graphite/80 rounded-lg group-hover:bg-sapphire-500/10 transition-all border border-white/5 group-hover:border-sapphire-500/20">
                <Mail size={13} />
              </span>
              hemangjoshi984@gmail.com
            </a>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-text-muted/50">
              © 2026 SlideUnlocker. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-text-muted/50">
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-amethyst-400" />
                Built with ❤️ by Hemang Joshi
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
