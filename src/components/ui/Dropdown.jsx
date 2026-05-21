"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";

/* GLOBAL SINGLE OPEN TRACKER */
let activeDropdown = null;
const Dropdown = ({
    icon,
    placeholder = "Select",
    options = [],
    value,
    onChange,
    disabled = false,
    searchable = false,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selectedLabel =
        options.find((o) => o.value === value)?.label || placeholder;

    const filteredOptions = searchable
        ? options.filter((opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase())
        )
        : options;

    const { refs, floatingStyles } = useFloating({
        open,
        onOpenChange: setOpen,
        middleware: [offset(6), flip(), shift({ padding: 10 })],
        whileElementsMounted: autoUpdate,
    });

    const handleToggle = () => {
        if (activeDropdown && activeDropdown !== setOpen) {
            activeDropdown(false);
        }

        activeDropdown = setOpen;
        setOpen((prev) => !prev);
    };

    useEffect(() => {
        return () => {
            if (activeDropdown === setOpen) {
                activeDropdown = null;
            }
        };
    }, []);

    return (
        <>
            {/* Trigger */}
            <div ref={refs.setReference} className="relative w-full">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={handleToggle}
                    className="
            w-full h-11 px-4 flex items-center gap-2 rounded-xl
            border border-primary-200 bg-white
            hover:border-secondary-400
            focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100
            text-sm transition-all
          "
                >
                    <Icon icon={icon} className="w-4 h-4 text-primary-500" />

                    <span className="flex-1 text-left truncate text-primary-600">
                        {selectedLabel}
                    </span>

                    <Icon
                        icon="mdi:chevron-down"
                        className="w-4 h-4 text-primary-400"
                    />
                </button>
            </div>

            {/* Dropdown */}
            {open &&
                createPortal(
                    <div
                        ref={refs.setFloating}
                        style={{
                            ...floatingStyles,
                            width: refs.reference.current
                                ? refs.reference.current.offsetWidth
                                : "auto",
                        }}
                        className="
              bg-white border border-primary-100
              rounded-xl shadow-xl overflow-hidden z-[99999]
            "
                    >
                        {/* Search */}
                        {searchable && (
                            <div className="p-2 border-b border-primary-100">
                                <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-lg">
                                    <Icon
                                        icon="mdi:magnify"
                                        className="w-4 h-4 text-primary-400"
                                    />

                                    <input
                                        autoFocus
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search..."
                                        className="
                      w-full bg-transparent outline-none text-sm
                      text-primary-700 placeholder:text-primary-300
                    "
                                    />
                                </div>
                            </div>
                        )}

                        {/* Options */}
                        <div className="max-h-52 overflow-y-auto">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            onChange(opt.value);
                                            setOpen(false);
                                            setSearch("");
                                        }}
                                        className={`
                      w-full px-4 py-2 text-left text-sm transition-all
                      hover:bg-secondary-50 hover:text-secondary-700
                      ${value === opt.value
                                                ? "bg-secondary-100 text-secondary-700 font-semibold"
                                                : "text-primary-600"
                                            }
                    `}
                                    >
                                        {opt.label}
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-sm text-primary-400 text-center">
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};


export default Dropdown;