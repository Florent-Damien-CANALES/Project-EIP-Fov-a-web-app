import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import { Product } from "../types";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const Item: FC = () => {
    const [product, setProduct] = useState<Product | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [barCodeImage, setBarCodeImage] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        // Fetch product
        const lastPath = location.pathname.split("/").filter(Boolean).pop();
        const fetchProduct = async () => {
            const product = await axios.get(`${API_URL}/products/${lastPath}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setProduct(product.data);
        };
        fetchProduct();
    }, [location.pathname]);

    useEffect(() => {
        if (product) {
            const fetchImagesAndBarCode = async () => {
                try {
                    // Sort product pictures
                    const sortedPictures = product.pictures.sort((a, b) => {
                        const matchA = a.url.match(/_(\d+)\.jpg$/);
                        const matchB = b.url.match(/_(\d+)\.jpg$/);
                        const numA = matchA ? parseInt(matchA[1]) : 0;
                        const numB = matchB ? parseInt(matchB[1]) : 0;
                        return numA - numB;
                    });

                    // Select images
                    const newImageArray = [
                        sortedPictures[0],
                        sortedPictures[Math.floor(sortedPictures.length / 2)],
                        sortedPictures[sortedPictures.length - 1],
                    ];

                    // Fetch images
                    const images = await Promise.all(
                        newImageArray.map(async (picture) => {
                            const response = await axios.get(
                                `${API_URL}${picture.url}`,
                                {
                                    responseType: "arraybuffer",
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                    },
                                }
                            );
                            const blob = new Blob([response.data], {
                                type: response.headers["content-type"],
                            });
                            return URL.createObjectURL(blob);
                        })
                    );
                    setImages(images);

                    // Fetch barcode
                    if (product.barCode?.pictureUrl) {
                        const barCodeResponse = await axios.get(
                            `${API_URL}${product.barCode.pictureUrl}`,
                            {
                                responseType: "arraybuffer",
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                            }
                        );
                        const barCodeBlob = new Blob([barCodeResponse.data], {
                            type: barCodeResponse.headers["content-type"],
                        });
                        setBarCodeImage(URL.createObjectURL(barCodeBlob));
                    }
                } catch (error) {
                    console.error("Error fetching images and barcode:", error);
                }
            };
            fetchImagesAndBarCode();
        }
    }, [product]);

    return product ? (
        <div className="w-full h-full">
            <div className="h-4/12 flex flex-row w-full space-x-5 overflow-hidden">
                <div className="h-full w-3/4">
                    <img
                        className="h-full w-full flex items-center justify-center object-cover"
                        src={images[0]}
                        alt="0"
                    />
                </div>
                <div className="flex flex-col w-1/4 space-y-5">
                    <div className="h-1/2">
                        <img
                            className="h-full flex items-center justify-center w-full object-cover"
                            src={images[1]}
                            alt="1"
                        />
                    </div>
                    <div className="h-1/2">
                        <img
                            className="h-full flex items-center justify-center w-full object-cover"
                            src={images[2]}
                            alt="2"
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-col h-8/12 pt-10 justify-between">
                <div className="flex flex-col space-y-10">
                    <div className="flex flex-row w-full space-x-10">
                        <div className="w-full space-y-2">
                            <Label htmlFor="name">Nom du produit</Label>
                            <Input
                                type="text"
                                disabled
                                id="name"
                                name="name"
                                value={product?.name || ""}
                            />
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="reference">
                                Référence du produit
                            </Label>
                            <Input
                                type="text"
                                disabled
                                id="reference"
                                name="reference"
                                value={product?.reference || ""}
                            />
                        </div>
                    </div>
                    <div className="flex flex-row w-full space-x-10">
                        <div className="w-full space-y-2">
                            <Label htmlFor="category">Catégorie</Label>
                            <Select
                                name="category"
                                disabled
                                value={product?.category?.id || ""}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        key={product!.category!.id!}
                                        value={product!.category!.id!}
                                    >
                                        {product!.category!.name}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="price">Prix</Label>
                            <Input
                                type="number"
                                step={0.01}
                                disabled
                                id="price"
                                name="price"
                                value={product?.price || ""}
                            />
                        </div>
                    </div>
                    <div className="w-full space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            className="resize-none h-40"
                            disabled
                            value={product?.description || ""}
                        ></Textarea>
                    </div>
                </div>
                {barCodeImage ? (
                    <img
                        src={barCodeImage}
                        className="h-32 w-full"
                        alt="Barcode"
                    />
                ) : null}
            </div>
        </div>
    ) : null;
};

export default Item;
