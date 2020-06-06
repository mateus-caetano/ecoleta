import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

import './styles.css';

interface Props {
  onFileUploaded: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ onFileUploaded }) => {
  const [selectedFilesUrl, setSelectedFilesUrl] = React.useState('');

  const onDrop = React.useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const fileUrl = URL.createObjectURL(file);

      setSelectedFilesUrl(fileUrl);
      onFileUploaded(file);
    },
    [onFileUploaded]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />
      {selectedFilesUrl ? (
        <img src={selectedFilesUrl} alt="Point thumbnail" />
      ) : (
        <p>
          <FiUpload /> Imagem do estabelecimento
        </p>
      )}
    </div>
  );
};

export default Dropzone;
