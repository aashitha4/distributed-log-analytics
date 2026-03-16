import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { triggerAnalysis, uploadLogFile } from '../services/api';

function FileUploader({ onComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      setFile(acceptedFiles[0]);
      setStatus('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false
  });

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setStatus('Uploading file...');

    try {
      const uploadResponse = await uploadLogFile(file);
      setStatus('Triggering Spark analysis...');
      await triggerAnalysis(uploadResponse.objectName);
      setStatus('Analysis triggered successfully.');
      if (onComplete) onComplete();
    } catch (error) {
      setStatus(error.response?.data?.error || error.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Upload Logs</h2>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop the file here...</p> : <p>Drag and drop a log file, or click to select.</p>}
      </div>
      {file && <p>Selected: {file.name}</p>}
      <button onClick={handleSubmit} disabled={!file || loading}>
        {loading ? 'Processing...' : 'Upload and Analyze'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default FileUploader;
