// import ImageSelector from '@/components/ImageSelector';
import VideoSelector from "@/components/VideoSelector";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";
import { Category } from "@/types";
import axios from "axios";
import { FC, useCallback, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const Ajout: FC = () => {
  const [productName, setProductName] = useState("");
  const [productReference, setProductReference] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("");

  const [video, setVideo] = useState<File | null>(null);
  const [reset, setReset] = useState(false);
  const [videoMode, setVideoMode] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get<Category[]>(`${API_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setReset(false);
  }, [reset]);

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  };

  const handleProductReferenceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductReference(e.target.value);
  };

  const handleProductDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProductDescription(e.target.value);
  };

  const handleProductPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductPrice(e.target.value);
  };

  const handleProductCategoryChange = (value: string) => {
    setProductCategory(value);
  };

  const handleFileChange = useCallback((file: File) => {
    // setPictures((prev) => {
    //   const newPictures = prev.slice();
    //   newPictures[Number(id) - 1] = file;
    //   return newPictures;
    // });
    setVideo(file);
  }, []);

  const handleSelectedChange = useCallback((selected: boolean) => {
    setVideoMode(selected);
    console.log("selected", selected);
  }, []);

  const { toast } = useToast();

  const handleAddProduct = async () => {
    const formData = new FormData();
    formData.append("name", productName);
    formData.append("reference", productReference);
    formData.append("price", productPrice);
    formData.append("description", productDescription);
    formData.append("category", productCategory);

    formData.append("video", video!);

    try {
      const response = await axios.post(`${API_URL}/products`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200) {
        toast({
          title: "Produit ajouté avec succès",
          description: `Le produit ${productName} a été ajouté avec succès.`,
        });

        setProductName("");
        setProductReference("");
        setProductPrice("");
        setProductDescription("");
        setProductCategory("");
        setReset(true);
        setVideo(null);
      }
    } catch (error) {
      toast({
        title: "Erreur lors de l'ajout du produit",
        description: `Une erreur est survenue lors de l'ajout du produit ${productName}.`,
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <div className="w-full h-full">
      <div
        className={
          !videoMode
            ? "h-4/12 flex flex-row w-full space-x-5 overflow-hidden"
            : "h-full flex flex-row w-full space-x-5 overflow-hidden"
        }
      >
        <div className="h-full w-full">
          <VideoSelector
            onFileChange={handleFileChange}
            onSelected={handleSelectedChange}
            reset={reset}
          />
        </div>
      </div>
      <div className="flex flex-col h-8/12 pt-10 justify-between">
        <div className="flex flex-col space-y-10">
          <div className="flex flex-row w-full space-x-10">
            <div className="w-full space-y-2">
              <Label htmlFor="name">Nom du produit</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={productName}
                onChange={handleProductNameChange}
                placeholder="Bague Cœur Élevé"
              />
            </div>
            <div className="w-full space-y-2">
              <Label htmlFor="reference">Référence du produit</Label>
              <Input
                type="text"
                id="reference"
                name="reference"
                value={productReference}
                onChange={handleProductReferenceChange}
                placeholder="BC-EL-001"
              />
            </div>
          </div>
          <div className="flex flex-row w-full space-x-10">
            <div className="w-full space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                name="category"
                onValueChange={handleProductCategoryChange}
                value={productCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    return (
                      <SelectItem key={category.id} value={category.id!}>
                        {category.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full space-y-2">
              <Label htmlFor="price">Prix</Label>
              <Input
                type="number"
                step={0.01}
                id="price"
                placeholder="49,00"
                name="price"
                value={productPrice}
                onChange={handleProductPriceChange}
              />
            </div>
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              className="resize-none h-60"
              placeholder="Célébrez l'amour en portant une bague captivante, élégante et sophistiquée. La technique de sertissage utilisée ayant pour effet de surélever les oxydes de zirconium cubiques accentue la brillance et l'éclat naturels de chaque pierre afin de symboliser la passion sans limites de votre histoire d'amour."
              value={productDescription}
              onChange={handleProductDescriptionChange}
            ></Textarea>
          </div>
        </div>
        <Button className="w-full" size={"lg"} onClick={handleAddProduct}>
          Ajouter le produit au catalogue
        </Button>
      </div>
    </div>
  );
};

export default Ajout;
