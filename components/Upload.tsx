import { useState, useCallback, useRef, useEffect } from "react";
import { useOutletContext } from "react-router";
import type { AuthContext } from "../type";
import { CheckCircle2, Image, Upload as UploadIcon } from "lucide-react";
import {
  PROGRESS_INCREMENT,
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "../lib/constants";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface UploadProps {
  onComplete?: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const { isSignedIn } = useOutletContext<AuthContext>();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processFile = useCallback(
    (file: File, onCompleteCallback?: (base64: string) => void) => {
      if (!isSignedIn) return;

      if (!file.type.startsWith("image/")) return;

      if (file.size > MAX_FILE_SIZE) {
        setError("File size exceeds the maximum allowed limit of 50MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        let currentProgress = 0;

        intervalRef.current = setInterval(() => {
          currentProgress += PROGRESS_INCREMENT;

          if (isMountedRef.current) {
            setProgress(currentProgress);
          }

          if (currentProgress >= 100) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }

            if (isMountedRef.current) {
              setProgress(100);

              timeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                  onCompleteCallback?.(base64);
                }
              }, REDIRECT_DELAY_MS);
            }
          }
        }, PROGRESS_INTERVAL_MS);
      };

      reader.readAsDataURL(file);
    },
    [isSignedIn]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isSignedIn) return;

      setError(null);
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        processFile(selectedFile, onComplete);
      }
    },
    [isSignedIn, processFile, onComplete]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (isSignedIn) {
        setIsDragging(true);
      }
    },
    [isSignedIn]
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      if (!isSignedIn) return;

      setError(null);
      const droppedFile = event.dataTransfer.files?.[0];
      if (droppedFile) {
        setFile(droppedFile);
        processFile(droppedFile, onComplete);
      }
    },
    [isSignedIn, processFile, onComplete]
  );

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png,"
            onChange={handleFileChange}
            disabled={!isSignedIn}
          />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Click to upload or just drag and drop"
                : "Sign in or sign up with puter to upload"}
            </p>
            <p className="help">Maximum file size 50MB.</p>
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <Image className="image" />
              )}
            </div>

            <h3>{file.name}</h3>
            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? "Analyzing floor plan ..." : "Redirecting...."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;