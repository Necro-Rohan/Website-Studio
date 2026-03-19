import React, { useState } from "react";
import { CloudDownload, SquareArrowUp, Copy, CheckCheck, Maximize, Minimize2, ExternalLink, Code, Eye } from "lucide-react";
import api from "../../utils/api";
import Editor from "@monaco-editor/react";


export default function EditBlog({ secretKey }) {
  const [editSlug, setEditSlug] = useState("");
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [isCopied, setIsCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editorTab, setEditorTab] = useState("code");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editData.htmlContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reverts back to "COPY" after 2 seconds
  };

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!editSlug) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await api.get(`/blog/${editSlug}`);
      setEditData(response.data);
      setMessage({ type: "success", text: "Data fetched securely." });
    } catch (error) {
      console.error("Fetch error:", error);
      setEditData(null);
      setMessage({ type: "error", text: "Blog not found." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!secretKey)
      return setMessage({ type: "error", text: "Master Admin Key required!" });
    setLoading(true);
    setMessage(null);
    try {
      await api.patch(`/update/${editData.slug}`, editData, {
        headers: { "x-admin-secret": secretKey },
      });
      setMessage({ type: "success", text: "SEO Data Patched Successfully!" });
    } catch (error) {
      console.error("Update error:", error);
      setMessage({ type: "error", text: "Failed to patch." });
    } finally {
      setLoading(false);
    }
  };

  // This HTML wrapper injects the exact typography and tailwind settings into the iframe
  const getPreviewHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700;900&display=swap" rel="stylesheet" />
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 2rem; 
              background-color: white;
            }
            h1, h2, h3, h4, h5, h6 { 
              font-family: 'Merriweather', serif !important; 
            }
            .prose table { display: block; max-width: 100%; overflow-x: auto; white-space: nowrap; }
            .prose a, .prose p, .prose h2, .prose h3 { overflow-wrap: break-word; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <div class="prose max-w-4xl mx-auto">
            ${editData?.htmlContent || ""}
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 animate-fade-in">
      <header className="border-b border-outline-variant pb-6 flex justify-between items-center">
        <div>
          <span className="text-primary font-bold text-xs tracking-widest uppercase mb-2 block font-body">
            Content Operations
          </span>
          <h2 className="text-4xl font-headline font-semibold text-on-surface">
            Live SEO Editor
          </h2>
        </div>
        {editData && (
          <div className="flex gap-3 flex-col lg:flex-row">
            <button
              onClick={() => window.open(`/blog/${editData.slug}`, "_blank")}
              className="px-2 md:px-6 py-1.5 md:py-2.5 bg-surface text-on-surface border border-outline font-medium text-sm hover:bg-surface-dim transition-all flex items-center gap-2 rounded"
            >
              <ExternalLink className="w-8 lg:w-6 h-8 lg:h-6 text-secondary" />
              Published Page
            </button>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-2 md:px-6 py-1.5 md:py-2.5 bg-primary text-on-primary font-medium text-sm rounded hover:opacity-90 flex items-center gap-2"
            >
              <SquareArrowUp className="w-8 lg:w-6 h-8 lg:h-6" />
              {loading ? "Saving..." : "Update Blog"}
            </button>
          </div>
        )}
      </header>

      {message && (
        <div
          className={`p-4 rounded-lg font-bold font-body ${message.type === "error" ? "bg-error-container text-error" : "bg-tertiary-container text-on-tertiary-container"}`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleFetch}
        className="bg-white p-6 border border-outline shadow-sm"
      >
        <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-3 font-body">
          Target URL Endpoint
        </label>
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium text-sm font-mono">
              /blog/
            </span>
            <input
              disabled={loading}
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
              className="w-full pl-16 pr-4 py-3 bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-0 text-sm font-mono transition-all"
              placeholder="enter-blog-slug-here"
              type="text"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !editSlug}
            className="py-3 px-4 justify-center bg-on-surface text-white font-bold text-xs uppercase tracking-widest hover:bg-primary transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">
              <CloudDownload className="w-5 h-5" />
            </span>{" "}
            Fetch
          </button>
        </div>
      </form>

      {editData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Metadata Column */}
          <div className="lg:col-span-4 xl:col-span-3 bg-white p-6 border border-outline shadow-sm h-full font-body">
            <h3 className="text-xl font-headline font-bold border-b border-outline-variant pb-4 mb-6">
              Metadata
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">H1 Main Title</label>
                <input value={editData.h1} onChange={(e) => setEditData({ ...editData, h1: e.target.value })} className="w-full p-3 bg-surface-container-lowest border border-outline focus:border-primary text-sm font-headline italic" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">SEO Meta Title</label>
                <input value={editData.metaTitle} onChange={(e) => setEditData({ ...editData, metaTitle: e.target.value })} className="w-full p-3 bg-surface-container-lowest border border-outline focus:border-primary text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Meta Description</label>
                <textarea value={editData.metaDescription} onChange={(e) => setEditData({ ...editData, metaDescription: e.target.value })} className="w-full p-3 bg-surface-container-lowest border border-outline focus:border-primary text-sm leading-relaxed" rows="6" />
              </div>
            </div>
          </div>

          {/* Raw Editor Column */}

          <div
            className={`bg-[#1e1e1e] border border-stone-800 shadow-xl flex flex-col transition-all duration-200 ${isFullScreen ? "fixed inset-0 z-50 w-screen h-screen rounded-none" : "lg:col-span-8 xl:col-span-9 h-full min-h-150"}`}
          >
            {/* Window Header with Tabs */}
            <div className="bg-[#252526] px-1 lg:px-4 pt-2 lg:pt-3 flex items-center justify-around lg:justify-between border-b border-black/50">
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex gap-1.5 pb-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>

                {/* THE NEW TAB BUTTONS */}
                <div className="flex gap-1 translate-y-px">
                  <button
                    onClick={() => setEditorTab("code")}
                    className={`px-1 lg:px-4 py-2 text-[11px] font-mono flex items-center gap-2 rounded-t border-t border-x transition-colors ${
                      editorTab === "code"
                        ? "bg-[#1e1e1e] text-[#9cdcfe] border-[#333]"
                        : "bg-transparent text-stone-500 border-transparent hover:bg-[#2d2d2d] hover:text-stone-300"
                    }`}
                  >
                    <Code className="w-3 h-3" /> raw_content.html
                  </button>
                  <button
                    onClick={() => setEditorTab("preview")}
                    className={`px-1 lg:px-4 py-2 text-[11px] font-mono flex items-center gap-2 rounded-t border-t border-x transition-colors ${
                      editorTab === "preview"
                        ? "bg-white text-stone-900 border-stone-200"
                        : "bg-transparent text-stone-500 border-transparent hover:bg-[#2d2d2d] hover:text-stone-300"
                    }`}
                  >
                    <Eye className="w-3 h-3" /> live_preview
                  </button>
                </div>
              </div>

              {/* Toolbar Actions */}
              <div className="flex items-center gap-4 z-10">
                {editorTab === "code" && (
                  <button
                    onClick={handleCopyCode}
                    className="text-[10px] font-bold text-stone-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {isCopied ? (
                      <CheckCheck className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="text-[10px] font-bold text-stone-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  {isFullScreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Content Engine (Swaps between Code and Iframe) */}
            <div className="flex-1 w-full relative">
              {editorTab === "code" ? (
                <div className="absolute inset-0 pt-2">
                  <Editor
                    height="100%"
                    defaultLanguage="html"
                    theme="vs-dark"
                    value={editData.htmlContent}
                    onChange={(value) =>
                      setEditData({ ...editData, htmlContent: value })
                    }
                    options={{
                      minimap: { enabled: false },
                      wordWrap: "on",
                      fontSize: 14,
                      padding: { top: 16, bottom: 16 },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                    }}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-white">
                  <iframe
                    title="Live Preview"
                    srcDoc={getPreviewHtml()}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}