// Scan.tsx
import Crosshair from '@/components/Crosshair';
import ProductScan from '@/components/ProductScan';
import { useAuth } from '@/hooks/useAuth';
import { ProductScan as PC, Prediction, Product } from '@/types';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";



const API_URL = import.meta.env.VITE_API_URL;

const Scan: React.FC = () => {
  const { loading } = useAuth();
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [apiAnswer, setApiAnswer] = useState<PC[]>([]);

  const navigation = useNavigate();

  const [productScanClicked, setProductScanClicked] = useState<boolean>(false);

  const init = async () => {
    setPhoto(null);
    setApiAnswer([]);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        aspectRatio: 3 / 4,
      },
      audio: false,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  useEffect(() => {
    init();
  }, []);

  if (loading) return <div>Loading...</div>;


  const handleButtonClick = () => {
    console.log('button clicked');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (videoRef.current && context) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(
        videoRef.current,
        0,
        0,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight
      );
      canvas.toBlob( async (blob) => {
        const file = new File([blob as Blob], 'photo.png', {
          type: 'image/png',
        });
        setPhoto(file);
        const formData = new FormData();
        formData.append("image", file!);

        try {
          const response = await axios.post(`${API_URL}/ai/categorize-product`, formData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          console.log(response.data);
          
          const predictions:Prediction[] = response.data.predictions;
          if (!predictions || predictions.length === 0) {
            toast({
              title: "Aucun produit trouvé",
              description: `Aucun produit n'a été trouvé dans la base de données.`,
              variant: "destructive",
            });
            init();
            return;
          }

          const scannedProducts:PC[] = []
          predictions.forEach( async prediction => {
            try {
              const response = await axios.get(`${API_URL}/products/${prediction.class}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              const product:Product = response.data;
              const newPC:PC = {
                id: product.id!,
                name: product.name,
                percentage: prediction.confidence,
                imageUrl: product.pictures[0].url,
                price: product.price,
                category: product.category?.id!,
              };

              scannedProducts.push(newPC);

            } catch (error) {
              console.error("Error fetching products:", error);
              init();
            }
          });

          setApiAnswer(scannedProducts);

        } catch (error) {
          toast({
            title: "Erreur lors de la recherche du produit",
            description: `Le produit pris en photo n'est pas trouvable dans la base de données.`,
            variant: "destructive",
          });

          init()
          console.error(error);
        }


      });
      // setApiAnswer([
      //   {
      //     id: roducts.id,
      //     name: 'Bracelet 1',
      //     category: '0846b19b-931c-4135-9537-16c0fc0857d2',
      //     percentage: 90,
      //     price: 100,
      //   },
      //   {
      //     id: '1637a8d5-3ce7-4225-9df8-f04591ed4bc6',
      //     name: 'Charm 1',
      //     category: '28fd9122-48c9-4945-8042-d1af478ed8a5',
      //     percentage: 80,
      //     price: 50,
      //   },
      //   {
      //     id: 'e64f6651-8e00-4a3b-b4d0-72794c85cfed',
      //     name: 'Bague 1',
      //     category: 'd51a2ef5-bcfe-4372-9ed1-71b69705118c',
      //     percentage: 60,
      //     price: 200,
      //   },
      //   {
      //     id: '775a922f-7f7d-4d4f-a289-f42898371a38',
      //     name: 'Collier 1',
      //     category: 'b3b55529-f4fa-4a7a-824b-b3655b1baf7a',
      //     percentage: 60,
      //     price: 300,
      //   },
      //   {
      //     id: 'c4d0ab00-69ec-427c-b7a8-316ab6ef79d9',
      //     name: 'Boucles 1',
      //     percentage: 60,
      //     category: '5ce44506-cc91-4b27-9bc5-33570e41c525',
      //     price: 150,
      //   },
      // ]);
    }
  };

  const handleProductScanClick = () => {
    console.log('product clicked');
    setProductScanClicked(true);
  };

  const handleProductScanUnityClick = (
    categoryId: string,
    productId: string
  ) => {
    navigation(`/catalogue/${categoryId}/${productId}`);
  };

  return (
    <div className='h-full w-full'>
      <div className='h-full w-full flex justify-center bg-black'>
        {photo == null ? (
          <div className='relative h-full w-max'>
            <video autoPlay ref={videoRef} className='relative h-full'></video>
            {/* <div className='w-96 h-96 border-4 border-green-600 absolute top-0 bottom-0 left-0 right-0 mx-auto my-auto'></div> */}
            <Crosshair onButtonClicked={handleButtonClick} buttonEnabled />
          </div>
        ) : (
          <div className='h-full w-max relative'>
            <img
              src={URL.createObjectURL(photo)}
              className='h-full w-max relative'
              alt='photo'
            />
            <Crosshair
              onButtonClicked={handleButtonClick}
              buttonEnabled={false}
            />
            {apiAnswer.length > 0 && !productScanClicked && (
              <div className='absolute bottom-20 right-0 left-0 transform'>
                <div className='relative'>
                  {apiAnswer
                    .slice(0, 3)
                    .reverse()
                    .map((product, index) => (
                      <ProductScan
                        key={product.name}
                        index={index}
                        product={product}
                        onClicked={handleProductScanClick}
                      />
                    ))}
                </div>
              </div>
            )}
            {apiAnswer.length > 0 && productScanClicked && (
              <div className='bg-black bg-opacity-60 absolute top-0 left-0 h-full w-full space-y-10 py-20'>
                {apiAnswer.slice(0, 5).map((product) => (
                  <ProductScan
                    key={product.name}
                    product={product}
                    onClicked={() =>
                      handleProductScanUnityClick(product.category, product.id)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;
