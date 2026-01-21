'use client';

import { useState } from 'react';

interface InfoIconProps {
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function InfoIcon({ text, position = 'top' }: InfoIconProps) {
    const [show, setShow] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div className="relative inline-flex items-center">
            <button
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                onClick={() => setShow(!show)}
                className="w-4 h-4 rounded-full bg-gray-200 hover:bg-blue-100 text-gray-500 hover:text-blue-600 text-xs flex items-center justify-center transition-colors cursor-help"
                type="button"
            >
                i
            </button>
            {show && (
                <div
                    className={`absolute z-50 ${positionClasses[position]} w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl`}
                >
                    <div className="relative">
                        {text}
                    </div>
                </div>
            )}
        </div>
    );
}
