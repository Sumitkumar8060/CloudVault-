import { FileText, Image, FileSpreadsheet, Archive, File } from 'lucide-react';

export const iconByType = {
  pdf: FileText,
  doc: FileText,
  image: Image,
  sheet: FileSpreadsheet,
  archive: Archive,
};

export function getFileIcon(type) {
  return iconByType[type] || File;
}