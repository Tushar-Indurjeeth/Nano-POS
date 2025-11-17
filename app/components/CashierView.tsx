"use client";

import { useState, useEffect } from "react";
import { ShowAlert } from "./ShowAlert";
import { CartItem, Product } from "../interfaces/Product";

export default function CashierView() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
          setSearchResults(data);
        } else {
          console.error("Failed to fetch products:", data);
          setAllProducts([]);
          setSearchResults([]);
        }
      });
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setSearchResults(
        allProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setSearchResults(allProducts);
    }
  }, [searchQuery, allProducts]);

  const addToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => (item.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0
  );
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setError(null);

    const checkoutId = crypto.randomUUID(); // Idempotency key

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": checkoutId,
        },
        body: JSON.stringify({
          total_amount: total,
          vat_amount: vat,
          items: cart.map(({ id, quantity, unit_price }) => ({
            product_id: id,
            quantity,
            unit_price,
          })),
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Checkout failed");
      }

      setCart([]);
      ShowAlert("Checkout successful!");
    } catch (err: unknown) {
      setError((err as Error).message || "An unknown error occurred");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      <div className="flex flex-col">
        <h2 className="text-2xl font-extrabold mb-5 text-blue-400">Products</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by SKU or name..."
          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 outline-none transition-all duration-200 text-lg"
        />
        <div className="mt-6 overflow-y-auto grow pr-2 custom-scrollbar">
          <ul className="space-y-4">
            {searchResults.map((product) => (
              <li
                key={product.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="mb-2 sm:mb-0">
                  <p className="text-lg font-semibold text-gray-100">
                    {product.name}{" "}
                    <span className="text-gray-400 text-sm">
                      ({product.sku})
                    </span>
                  </p>
                  <p className="text-blue-300 text-xl font-bold mt-1">
                    R{product.unit_price}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    id={`quantity-${product.id}`}
                    className="w-24 p-2 rounded-md bg-gray-700 border border-gray-600 text-center text-white text-lg focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const quantityInput = document.getElementById(
                        `quantity-${product.id}`
                      ) as HTMLInputElement;
                      const quantity = parseInt(quantityInput.value);
                      if (quantity > 0) {
                        addToCart(product, quantity);
                      }
                    }}
                    className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg font-medium shadow-md cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-extrabold mb-5 text-green-400">Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            Your cart is empty. Add some products!
          </p>
        ) : (
          <div className="flex flex-col h-full">
            <div className="overflow-y-auto grow pr-2 custom-scrollbar mb-4">
              <ul className="space-y-3">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-gray-700 rounded-lg shadow-sm"
                  >
                    <div>
                      <p className="text-lg font-medium text-gray-100">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-300">
                        ${item.unit_price} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value))
                        }
                        className="w-20 p-1 rounded-md bg-gray-600 border border-gray-500 text-center text-white text-base focus:ring-1 focus:ring-green-500 outline-none"
                        min="1"
                      />
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-600 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto pt-5 border-t border-gray-600 space-y-3">
              <p className="flex justify-between text-xl">
                <span>Subtotal:</span>{" "}
                <span className="font-semibold">R{subtotal.toFixed(2)}</span>
              </p>
              <p className="flex justify-between text-xl">
                <span>VAT (15%):</span>{" "}
                <span className="font-semibold">R{vat.toFixed(2)}</span>
              </p>
              <p className="flex justify-between font-extrabold text-2xl text-green-300">
                <span>Total:</span> <span>R{total.toFixed(2)}</span>
              </p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || cart.length === 0}
              className="w-full mt-6 p-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 transition-colors duration-200 text-xl font-bold shadow-lg cursor-pointer"
            >
              {isCheckingOut ? "Processing..." : "Complete Sale"}
            </button>
            {error && (
              <p className="text-red-400 mt-3 text-center text-lg">
                Error: {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
