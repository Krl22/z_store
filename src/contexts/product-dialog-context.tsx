import React, { createContext, useContext, useState, ReactNode } from 'react';

type Producto = {
  ID: string;
  Tipo: string;
  Categoria: string;
  Subcategoria: string;
  Hongo: string;
  Nombre: string;
  stock: string;
  unidad: string;
  precio: string;
  image: string;
  descripcion: string;
  promocion?: string;
};

interface ProductDialogContextType {
  selectedProduct: Producto | null;
  isDialogOpen: boolean;
  openProductDialog: (producto: Producto) => void;
  closeProductDialog: () => void;
}

const ProductDialogContext = createContext<ProductDialogContextType | undefined>(undefined);

export const useProductDialog = () => {
  const context = useContext(ProductDialogContext);
  if (context === undefined) {
    throw new Error('useProductDialog must be used within a ProductDialogProvider');
  }
  return context;
};

interface ProductDialogProviderProps {
  children: ReactNode;
}

export const ProductDialogProvider: React.FC<ProductDialogProviderProps> = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openProductDialog = (producto: Producto) => {
    console.log('openProductDialog called with:', producto);
    setSelectedProduct(producto);
    setIsDialogOpen(true);
  };

  const closeProductDialog = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  const value: ProductDialogContextType = {
    selectedProduct,
    isDialogOpen,
    openProductDialog,
    closeProductDialog,
  };

  return (
    <ProductDialogContext.Provider value={value}>
      {children}
    </ProductDialogContext.Provider>
  );
};