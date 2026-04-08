import { useState, useCallback } from "react";
import { useOutletContext } from "react-router";
import type { AuthContext } from "../type";
import { CheckCircle2, Image, Upload as UploadIcon } from "lucide-react";
import {
  PROGRESS_INCREMENT,
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "../lib/constants";

interface UploadProps {
  onComplete?: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const { isSignedIn } = useOutletContext<AuthContext>();

  const processFile = useCallback(
    (file: File, onCompleteCallback?: (base64: string) => void) => {
      if (!isSignedIn) return;

      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        let currentProgress = 0;

        const interval = setInterval(() => {
          currentProgress += PROGRESS_INCREMENT;
          setProgress(currentProgress);

          if (currentProgress >= 100) {
            clearInterval(interval);
            setProgress(100);

            setTimeout(() => {
              onCompleteCallback?.(base64);
            }, REDIRECT_DELAY_MS);
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