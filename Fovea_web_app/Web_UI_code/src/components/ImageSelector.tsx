import { Camera } from 'lucide-react';
import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';

interface ImageSelectorProps {
  id: string;
  onFileChange: (file: File, id: string) => void;
  reset: boolean;
}

const ImageSelector: FC<ImageSelectorProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (props.reset) {
      setFile(null);
    }
  }, [props.reset])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      props.onFileChange(files[0], props.id);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className='h-full'>
      {file != null ? (
        <div className='h-full'>
          <img
            src={URL.createObjectURL(file)}
            alt='preview'
            className='h-full w-full object-cover'
            onClick={handleClick}
          />
          <Input
            type='file'
            className='hidden'
            onChange={handleChange}
            ref={inputRef}
            accept='image/png, image/jpeg, image/jpg'
          />
        </div>
      ) : (
        <div className='h-full bg-slate-50 border-slate-300 border-dashed border-4 flex items-center justify-center'>
          <Camera size={50} className='text-slate-400' onClick={handleClick} />
          <Input
            type='file'
            className='hidden'
            onChange={handleChange}
            ref={inputRef}
            accept='image/png, image/jpeg, image/jpg'
          />
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
