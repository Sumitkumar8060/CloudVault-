// Maps a MIME type to the kind of inline preview we can render.
// Centralized here so FileRow (deciding whether to enable "Preview")
// and FileViewerModal (deciding what to render) always agree.
export function getPreviewKind(mimeType) {
  if (!mimeType) return 'unsupported';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('text/')) return 'text';
  return 'unsupported';
}