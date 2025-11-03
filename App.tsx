
import React, { useState } from 'react';
import JsonConverter from './components/JsonConverter';
import MerchantConfig from './components/MerchantConfig';

type View = 'json' | 'config';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('json');

    const getNavButtonClasses = (view: View) => {
        const baseClasses = 'py-2 px-6 rounded-lg font-semibold transition-colors duration-200';
        if (activeView === view) {
            if (view === 'json') {
                return `${baseClasses} bg-blue-600 text-white shadow-lg`;
            }
            return `${baseClasses} bg-teal-600 text-white shadow-lg`;
        }
        return `${baseClasses} bg-gray-700 text-gray-300 hover:bg-gray-600`;
    };

    return (
        <div className="p-4 md:p-8">
            <nav className="max-w-7xl mx-auto flex justify-center gap-4 mb-8">
                <button
                    onClick={() => setActiveView('json')}
                    className={getNavButtonClasses('json')}
                >
                    Trình Chuyển Đổi JSON
                </button>
                <button
                    onClick={() => setActiveView('config')}
                    className={getNavButtonClasses('config')}
                >
                    Cấu hình Merchant
                </button>
            </nav>

            <main>
                {activeView === 'json' && <JsonConverter />}
                {activeView === 'config' && <MerchantConfig />}
            </main>
        </div>
    );
};

export default App;
