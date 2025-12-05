'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploadPanelProps {
  onFilesReady: (files: File[]) => void;
  onBack: () => void;
  isProcessing: boolean;
}

const ACCEPTED_TYPES = ['.pdf', '.csv', '.txt', '.md'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploadPanel({ onFilesReady, onBack, isProcessing }: FileUploadPanelProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(extension)) {
      return `Unsupported file type. Accepted: ${ACCEPTED_TYPES.join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit';
    }
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const newUploadedFiles: UploadedFile[] = fileArray.map((file) => {
      const validationError = validateFile(file);
      return {
        id: generateId(),
        file,
        status: validationError ? 'error' : 'pending',
        error: validationError || undefined,
      };
    });

    setFiles((prev) => [...prev, ...newUploadedFiles]);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    const validFiles = files.filter((f) => f.status === 'pending').map((f) => f.file);
    if (validFiles.length > 0) {
      onFilesReady(validFiles);
    }
  };

  const validFileCount = files.filter((f) => f.status === 'pending').length;

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-[#ff71ce]" />;
      case 'csv':
        return <File className="w-5 h-5 text-[#05ffa1]" />;
      case 'txt':
      case 'md':
        return <FileText className="w-5 h-5 text-[#01cdfe]" />;
      default:
        return <File className="w-5 h-5 text-[#b967ff]" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto font-['VT323',monospace]">
      {/* Window Frame */}
      <div className="bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-bold tracking-wide">Upload Files</span>
          </div>
          <div className="flex gap-1">
            <button className="w-4 h-3.5 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center text-[10px] font-bold">
              _
            </button>
            <button className="w-4 h-3.5 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center text-[10px] font-bold">
              □
            </button>
            <button className="w-4 h-3.5 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center text-[10px] font-bold">
              ×
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 bg-[#008080]">
          <div className="text-center mb-4">
            <h2 className="text-xl text-white drop-shadow-[2px_2px_#000080] tracking-wider">
              📁 Upload Your Files
            </h2>
            <p className="text-[#fffb96] text-sm mt-1">
              Supported: PDF, CSV, TXT, MD (Max 10MB)
            </p>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-4 border-dashed p-8 text-center cursor-pointer transition-all',
              isDragging
                ? 'border-[#05ffa1] bg-[#05ffa1]/20 shadow-[0_0_20px_rgba(5,255,161,0.5)]'
                : 'border-[#c0c0c0] bg-[#000080]/30 hover:border-[#ff71ce] hover:bg-[#ff71ce]/10'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  'w-16 h-16 flex items-center justify-center',
                  isDragging ? 'animate-bounce' : ''
                )}
              >
                <Upload
                  className={cn(
                    'w-10 h-10',
                    isDragging ? 'text-[#05ffa1] drop-shadow-[0_0_10px_#05ffa1]' : 'text-[#ff71ce] drop-shadow-[0_0_10px_#ff71ce]'
                  )}
                />
              </div>
              <div>
                <p className="text-white text-lg tracking-wide">
                  {isDragging ? ':: DROP FILES HERE ::' : ':: DRAG & DROP FILES ::'}
                </p>
                <p className="text-[#01cdfe] text-sm mt-1">
                  or click to browse
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4">
              <div className="bg-[#c0c0c0] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] p-1 mb-2">
                <span className="text-[#000080] text-sm font-bold px-2">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 bg-white shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff,inset_2px_2px_#404040] p-2">
                {files.map((uploadedFile) => (
                  <div
                    key={uploadedFile.id}
                    className={cn(
                      'flex items-center gap-3 p-2 border-2',
                      uploadedFile.status === 'error'
                        ? 'bg-[#ff71ce]/20 border-[#ff71ce]'
                        : 'bg-[#000080]/10 border-[#000080]'
                    )}
                  >
                    {getFileIcon(uploadedFile.file.name)}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#000080] truncate font-bold">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-[#808080]">
                        {(uploadedFile.file.size / 1024).toFixed(1)} KB
                      </p>
                      {uploadedFile.error && (
                        <p className="text-xs text-[#ff0000] mt-1">{uploadedFile.error}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {uploadedFile.status === 'pending' && (
                        <CheckCircle2 className="w-4 h-4 text-[#05ffa1]" />
                      )}
                      {uploadedFile.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 text-[#01cdfe] animate-spin" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-[#ff71ce]" />
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(uploadedFile.id);
                        }}
                        className="w-5 h-5 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center hover:bg-[#ff71ce] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]"
                      >
                        <X className="w-3 h-3 text-[#000080]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Bar / Actions */}
        <div className="bg-[#c0c0c0] border-t-2 border-[#dfdfdf] p-2 flex items-center justify-between">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="px-4 py-1 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold text-sm hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf] disabled:opacity-50"
          >
            ◀ Back
          </button>

          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-[#c0c0c0] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] text-xs text-[#000080]">
              Ready: {validFileCount} files
            </div>
            <button
              onClick={handleSubmit}
              disabled={validFileCount === 0 || isProcessing}
              className={cn(
                'px-4 py-1 font-bold text-sm',
                'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                'active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]',
                'disabled:opacity-50',
                validFileCount > 0 && !isProcessing
                  ? 'bg-[#05ffa1] text-[#000080] hover:bg-[#00ff88]'
                  : 'bg-[#c0c0c0] text-[#808080]'
              )}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span>Process {validFileCount} File{validFileCount !== 1 ? 's' : ''} ▶</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
