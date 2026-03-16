import FileUploader from '../components/FileUploader';

function UploadPage({ onUploaded }) {
  return (
    <div className="card">
      <FileUploader onComplete={onUploaded} />
    </div>
  );
}

export default UploadPage;
