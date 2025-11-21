"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { useSelectStore } from "@/components/select/useSelectStore";

export interface CartProduct
  extends Pick<any, "id" | "name" | "price" | "mediaPath" | "mediaName" | "stock" | "companyId"> {
  quantity: number;
  fullPrice: number
}

export interface ICartContext {
  isOpen: boolean;
  finishOrderDialogIsOpen: boolean;
  productsInCart: CartProduct[];
  total: number;
  totalFull: number;
  totalQuantity: number;
  toggleCart: () => void;
  toggleFinishOrder: () => void;
  addProduct: (product: CartProduct) => void;
  decreaseProductQuantity: (productId: number) => void;
  increaseProductQuantity: (productId: number) => void;
  removeProduct: (productId: number) => void;
  clearCart: () => void
}

export const CartContext = createContext<ICartContext>({
  isOpen: false,
  finishOrderDialogIsOpen: false,
  total: 0,
  totalFull: 0,
  totalQuantity: 0,
  productsInCart: [],
  toggleCart: () => { },
  toggleFinishOrder: () => { },
  addProduct: () => { },
  decreaseProductQuantity: () => { },
  increaseProductQuantity: () => { },
  removeProduct: () => { },
  clearCart: () => { }
});

export const CartProvider = ({ children }: { children: ReactNode }) => {


  const [productsInCart, setProductsInCart] = useState<CartProduct[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { selectedStore } = useSelectStore()
  const [finishOrderDialogIsOpen, setFinishOrderDialogIsOpen] = useState(false);

  const total = productsInCart.reduce((acc, product) => {
    return acc + product.price * product.quantity;
  }, 0);
  const totalFull = productsInCart.reduce((acc, product) => {
    return acc + product.fullPrice * product.quantity;
  }, 0);
  const totalQuantity = productsInCart.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  const toggleCart = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleFinishOrder = () => {
    setFinishOrderDialogIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const cart = localStorage.getItem('cart')
    if (cart) {
      setProductsInCart(JSON.parse(cart))
    }
  }, [])

  const addProduct = (product: CartProduct) => {

    const productIsAlreadyOnTheCart = productsInCart.some(
      (prevProduct) => prevProduct.id === product.id,
    );
    if (!productIsAlreadyOnTheCart) {
      return setProductsInCart((prev) => {
        const newCart = [...prev, product]
        localStorage.setItem('cart', JSON.stringify(newCart))
        return newCart;
      });
    }
    setProductsInCart((prevproductsInCart) => {
      const newCart = prevproductsInCart.map((prevProduct) => {
        if (prevProduct.id === product.id) {
          return {
            ...prevProduct,
            quantity: prevProduct.quantity + product.quantity,
          };
        }
        return prevProduct;
      });
      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    });
  };

  const decreaseProductQuantity = (productId: number) => {
    setProductsInCart((prevproductsInCart) => {
      const newCart = prevproductsInCart.map((prevProduct) => {
        if (prevProduct.id !== productId) {
          return prevProduct;
        }
        if (prevProduct.quantity === 1) {
          return prevProduct;
        }
        return { ...prevProduct, quantity: prevProduct.quantity - 1 };
      });
      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    });
  };

  const increaseProductQuantity = (productId: number) => {
    setProductsInCart((prevproductsInCart) => {
      const newCart = prevproductsInCart.map((prevProduct) => {
        if (prevProduct.id !== productId) {
          return prevProduct;
        }
        return { ...prevProduct, quantity: prevProduct.quantity + 1 };
      });
      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    });
  };

  const removeProduct = (productId: number) => {
    setProductsInCart((prevproductsInCart) => {
      const newCart = prevproductsInCart.filter((prevProduct) => prevProduct.id !== productId)
      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    }

    );
  };

  const clearCart = () => {
    setProductsInCart(prevState => {
      localStorage.setItem('cart', JSON.stringify([]))
      return []
    })
  }

  return (
    <CartContext.Provider
      value={{
        isOpen,
        productsInCart,
        finishOrderDialogIsOpen,
        toggleCart,
        toggleFinishOrder,
        addProduct,
        decreaseProductQuantity,
        increaseProductQuantity,
        removeProduct,
        clearCart,
        total,
        totalFull,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
