import { FC } from 'react';

type Props = {
  onButtonClicked: () => void;
  buttonEnabled: boolean;
};

const Crosshair: FC<Props> = (props: Props) => {
  return (
    <div className='absolute top-0 bottom-0 right-0 left-0 mx-auto my-auto w-max h-max space-y-32'>
      <div className='w-96 h-96 bg-slate-600 bg-opacity-10'>
        <div className='absolute w-10 h-10 border-l-4 border-slate-800 border-t-4 top-0 left-0'></div>
        <div className='absolute w-10 h-10 border-r-4 border-slate-800 border-t-4 top-0 right-0'></div>
        <div className='absolute w-10 h-10 border-l-4 border-slate-800 border-b-4 bottom-0 left-0'></div>
        <div className='absolute w-10 h-10 border-r-4 border-slate-800 border-b-4 bottom-0 right-0'></div>
      </div>
      {props.buttonEnabled ? (
        <div
          className='w-28 h-28 absolute right-0 left-0 mx-auto border-white border-8 rounded-full'
          onClick={props.onButtonClicked}
        ></div>
      ) : null}
    </div>
  );
};

export default Crosshair;
