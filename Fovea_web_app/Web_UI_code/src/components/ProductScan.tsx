import { ProductScan as PC } from '@/types';
import { FC } from 'react';
import CircularProgress from './CircularProgress';

type ProductScanProps = {
  product: PC;
  index?: number;
  onClicked?: () => void;
};

const ProductScan: FC<ProductScanProps> = ({
  index,
  product,
  onClicked,
}: ProductScanProps) => {
  return (
    <div
      key={product.name}
      className='absolute flex flex-row text-white bg-slate-800 mx-auto px-5 py-5 rounded-3xl justify-between items-center'
      style={index != null && {
        left: 0,
        right: 0,
        bottom: `${index * 20}px`,
        // remove a little bit of width on each iteration
        width: `calc(34rem + ${index * 3}rem)`,
        // remove a little bit of opacity on each iteration
        opacity: 1 / 3 + index * (1 / 3),
        margin: '0 auto',
        // top: `${index * 20}px`,
      } || {
        left: 0,
        right: 0,
        position: 'relative',
        width: '38rem',
      }}
      onClick={onClicked}
    >
      <div className='flex flex-row space-x-10 items-center'>
        <img
          src='https://www.charitycomms.org.uk/wp-content/uploads/2019/02/placeholder-image-square.jpg'
          className='h-32 rounded-3xl'
        />
        <div className='flex flex-col'>
          <p className='text-2xl font-bold'>{product.name}</p>
          <p className='text-lg'>{product.price}</p>
        </div>
      </div>
      {/* <p className='text-2xl font-bold px-10 py-10 border-2'>{product.percentage}</p> */}
      <CircularProgress percentage={product.percentage} />
    </div>
  );
};

export default ProductScan;
