import { useState, useCallback } from "react";

// Types for cart items and cart state
interface CartItem {
	productId: string;
	quantity: number;
}

interface Cart {
	[cartId: string]: Record<string, CartItem>;
}

interface UseCart {
	cart: Cart;
	setQuantity: (cartId: string, productId: string, quantity: number) => void;
	updateCart: (cartId: string, productId: string, action: "INCREASE" | "DECREASE") => void;
}

// Custom hook to manage the cart state
export function useCart(): UseCart {
	const [cart, setCart] = useState<Cart>({});

	// Function to set quantity of a cart item
	const setQuantity = useCallback((cartId: string, productId: string, quantity: number) => {
		setCart((prevCart) => {
			const updatedCart = { ...prevCart };
			if (!updatedCart[cartId]) {
				updatedCart[cartId] = {};
			}
			updatedCart[cartId][productId] = { productId, quantity };
			return updatedCart;
		});
	}, []);

	// Function to increase or decrease the quantity of a cart item
	const updateCart = useCallback((cartId: string, productId: string, action: "INCREASE" | "DECREASE") => {
		setCart((prevCart) => {
			const updatedCart = { ...prevCart };
			const currentItem = updatedCart[cartId]?.[productId];

			if (currentItem) {
				const newQuantity = action === "INCREASE" ? currentItem.quantity + 1 : currentItem.quantity - 1;
				updatedCart[cartId] = {
					...updatedCart[cartId],
					[productId]: { ...currentItem, quantity: newQuantity },
				};
			} else if (action === "INCREASE") {
				// If the item doesn't exist, create it with quantity 1
				updatedCart[cartId] = { ...updatedCart[cartId], [productId]: { productId, quantity: 1 } };
			}
			return updatedCart;
		});
	}, []);

	return { cart, setQuantity, updateCart };
}
