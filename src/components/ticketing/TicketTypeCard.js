'use client';

/**
 * Ticket Type Card Component
 * Displays individual ticket type with pricing and quantity selector
 */

import { useState } from 'react';
import { useCart } from '@/hooks/useTicketing';
import { Button } from '@/components/common/Button';
import { Ticket, Check, AlertCircle, Minus, Plus } from 'lucide-react';

export default function TicketTypeCard({ ticketType }) {
    const { cart, addToCart, updateQuantity } = useCart();
    const [quantity, setQuantity] = useState(1);

    // Check if this ticket type is in cart
    const cartItem = cart.find(item => item.ticketTypeId === ticketType.id);
    const inCart = !!cartItem;
    const cartQuantity = cartItem?.quantity || 0;

    // Calculate availability
    const available = ticketType.available;
    const soldOut = ticketType.soldOut || available <= 0;

    const handleAddToCart = () => {
        if (!soldOut) {
            addToCart(ticketType.id, quantity);
            setQuantity(1); // Reset quantity after adding
        }
    };

    const handleUpdateQuantity = (newQuantity) => {
        if (newQuantity >= ticketType.minPerOrder && newQuantity <= ticketType.maxPerOrder) {
            updateQuantity(ticketType.id, newQuantity);
        }
    };

    const incrementQuantity = () => {
        if (quantity < ticketType.maxPerOrder && quantity < available) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > ticketType.minPerOrder) {
            setQuantity(quantity - 1);
        }
    };

    return (
        <div className={`bg-white rounded-xl shadow-md border-2 transition-all ${inCart ? 'border-primary shadow-lg' : 'border-gray-100 hover:border-gray-200'
            } ${soldOut ? 'opacity-60' : ''}`}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Ticket className={`w-5 h-5 ${inCart ? 'text-primary' : 'text-gray-400'}`} />
                            <h3 className="text-xl font-bold text-gray-900">
                                {ticketType.name}
                            </h3>
                        </div>
                        {ticketType.description && (
                            <p className="text-gray-600 text-sm">
                                {ticketType.description}
                            </p>
                        )}
                    </div>
                    <div className="text-right ml-4">
                        <div className="text-3xl font-bold text-gray-900">
                            £{(ticketType.price / 100).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">per ticket</div>
                    </div>
                </div>

                {/* Availability */}
                <div className="mb-4">
                    {soldOut ? (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Sold Out</span>
                        </div>
                    ) : available < 10 ? (
                        <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Only {available} tickets left!
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {available} tickets available
                            </span>
                        </div>
                    )}
                </div>

                {/* Additional Info */}
                {ticketType.settings?.includes && (
                    <div className="mb-4 bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Includes:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            {ticketType.settings.includes.map((item, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <Check className="w-3 h-3 text-primary" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Quantity Limits */}
                <div className="mb-4 text-xs text-gray-500">
                    {ticketType.minPerOrder > 1 && (
                        <span>Min: {ticketType.minPerOrder} • </span>
                    )}
                    <span>Max: {ticketType.maxPerOrder} per order</span>
                </div>

                {/* Actions */}
                {!inCart ? (
                    <div className="flex items-center gap-3">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-[42px]">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={decrementQuantity}
                                disabled={quantity <= ticketType.minPerOrder || soldOut}
                                className="rounded-none bg-gray-50 hover:bg-gray-100 h-full px-3"
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                            <div className="px-4 font-semibold min-w-[3rem] text-center">
                                {quantity}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={incrementQuantity}
                                disabled={quantity >= ticketType.maxPerOrder || quantity >= available || soldOut}
                                className="rounded-none bg-gray-50 hover:bg-gray-100 h-full px-3"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            variant="primary"
                            onClick={handleAddToCart}
                            disabled={soldOut}
                            className="flex-1"
                        >
                            {soldOut ? 'Sold Out' : 'Add to Cart'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* In Cart Indicator */}
                        <div className="flex items-center justify-between bg-primary/10 px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-2 text-primary font-medium">
                                <Check className="w-5 h-5" />
                                <span>In Cart</span>
                            </div>
                            <span className="text-primary font-bold">
                                {cartQuantity} × £{(ticketType.price / 100).toFixed(2)}
                            </span>
                        </div>

                        {/* Update Quantity */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                            <div className="flex items-center border border-primary rounded-lg overflow-hidden h-[42px]">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(cartQuantity - 1)}
                                    disabled={cartQuantity <= ticketType.minPerOrder}
                                    className="rounded-none bg-primary/10 hover:bg-primary/20 h-full px-3 text-primary hover:text-primary"
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <div className="px-4 font-semibold min-w-[3rem] text-center text-primary">
                                    {cartQuantity}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(cartQuantity + 1)}
                                    disabled={cartQuantity >= ticketType.maxPerOrder || cartQuantity >= available}
                                    className="rounded-none bg-primary/10 hover:bg-primary/20 h-full px-3 text-primary hover:text-primary"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
