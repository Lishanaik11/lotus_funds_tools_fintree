import { useMemo, useState } from "react";
import { STOCK_DATA } from "../assets/stocks";

type ExchangeType = "NSE" | "BSE";

export function useStockAutocomplete(exchangeType: ExchangeType) {
    const [inputValue, setInputValue] = useState("");
    const [suggestion, setSuggestion] = useState("");
    const [isProgrammatic, setIsProgrammatic] = useState(false);

    // 🔥 Pre-normalize once
    const options = useMemo(() => {
        const raw = STOCK_DATA[exchangeType] || [];

        return raw.map((s) => ({
            original: s,
            lower: s.toLowerCase(),
        }));
    }, [exchangeType]);

    // 🔥 For modify click (no heavy filtering)
    const setDirectValue = (value: string) => {
        setIsProgrammatic(true);
        setInputValue(value);
        setSuggestion("");
    };

    // 🔥 Optimized matching
    const matches = useMemo(() => {
        if (!inputValue) return [];

        // Skip filtering when value is programmatically set
        if (isProgrammatic) {
            setIsProgrammatic(false);
            return [];
        }

        const lowerInput = inputValue.toLowerCase();

        return options
            .filter((s) => s.lower.startsWith(lowerInput))
            .slice(0, 20) // 👈 limit results for performance
            .map((s) => s.original);
    }, [inputValue, options, isProgrammatic]);

    const open = inputValue.length > 0 && matches.length > 0;

    const handleInputChange = (_: any, value: string) => {
        setIsProgrammatic(false);
        setInputValue(value);

        if (value.length > 0 && matches.length > 0) {
            setSuggestion(matches[0]);
        } else {
            setSuggestion("");
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Tab" && suggestion) {
            setInputValue(suggestion);
            setSuggestion("");
            event.preventDefault();
        }
    };

    return {
        inputValue,
        setDirectValue,
        suggestion,
        matches,
        open,
        handleInputChange,
        handleKeyDown,
    };
}