
import React, { useState, useCallback } from 'react';
import { generateJson, fixJson, explainJson } from '../services/geminiService';
import { EscapeIcon, UnescapeIcon, GeminiIcon, SwapIcon, ClearIcon } from './Icons';

type StatusType = 'error' | 'success' | 'loading' | 'info';

const JsonConverter: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState<{ message: string; type: StatusType } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPrettyInput, setIsPrettyInput] = useState(true);
    const [isPrettyOutput, setIsPrettyOutput] = useState(true);

    const showStatus = (message: string, type: StatusType, duration: number | null = 3000) => {
        setStatus({ message, type });
        if (duration) {
            setTimeout(() => setStatus(null), duration);
        }
    };

    const handleEscape = useCallback(() => {
        if (!input) return showStatus("Lỗi: Không có nội dung đầu vào.", 'error');
        try {
            const obj = JSON.parse(input);
            const minifiedString = JSON.stringify(obj);
            const escapedString = JSON.stringify(minifiedString);
            setOutput(escapedString);
            showStatus("Đã escape JSON thành chuỗi thành công!", 'success');
        } catch (e) {
            const err = e as Error;
            showStatus(`Lỗi: JSON đầu vào không hợp lệ. ${err.message}`, 'error');
        }
    }, [input]);

    const handleUnescape = useCallback(() => {
        if (!input) return showStatus("Lỗi: Không có nội dung đầu vào.", 'error');
        try {
            const unescapedString = JSON.parse(input);
            if (typeof unescapedString !== 'string') {
                throw new Error("Đầu vào không phải là một chuỗi JSON đã được escape.");
            }
            const obj = JSON.parse(unescapedString);
            setOutput(JSON.stringify(obj, null, isPrettyOutput ? 2 : undefined));
            showStatus("Đã unescape chuỗi thành JSON thành công!", 'success');
        } catch (e) {
            const err = e as Error;
            showStatus(`Lỗi: Chuỗi escape không hợp lệ. ${err.message}`, 'error');
        }
    }, [input, isPrettyOutput]);

    const handleSwap = useCallback(() => {
        setInput(output);
        setOutput(input);
        showStatus("Đã hoán đổi nội dung.", 'info');
    }, [input, output]);

    const handleClear = useCallback(() => {
        setInput('');
        setOutput('');
        setStatus(null);
    }, []);

    const handleFormat = useCallback((
        text: string, 
        setter: React.Dispatch<React.SetStateAction<string>>,
        isPretty: boolean,
        togglePretty: () => void,
        fieldName: string
    ) => {
        togglePretty();
        if (!text) return;
        try {
            const obj = JSON.parse(text);
            setter(JSON.stringify(obj, null, !isPretty ? 2 : undefined));
            showStatus(`Đã định dạng ${fieldName}: ${!isPretty ? 'Đẹp' : 'Gọn'}`, 'success');
        } catch (e) {
            // Ignore if formatting fails, it's not valid JSON
        }
    }, []);


    const runGeminiAction = async (action: (prompt: string) => Promise<string>, inputPrompt: string, successMessage: string) => {
        if (!inputPrompt) {
            showStatus("Lỗi: Vui lòng nhập nội dung đầu vào.", 'error');
            return;
        }
        setIsLoading(true);
        showStatus("Đang gọi Gemini... ✨", 'loading', null);
        try {
            const result = await action(inputPrompt);
            // For actions that return JSON, try to format it
            try {
                const obj = JSON.parse(result);
                setOutput(JSON.stringify(obj, null, isPrettyOutput ? 2 : undefined));
            } catch (e) {
                // If it's not JSON (like an explanation), just set the raw text
                setOutput(result);
            }
            showStatus(successMessage, 'success');
        } catch (e) {
            const err = e as Error;
            showStatus(`Lỗi: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };


    const getStatusColor = (type: StatusType) => {
        switch (type) {
            case 'error': return 'text-red-400';
            case 'success': return 'text-green-400';
            case 'loading': return 'text-yellow-400';
            case 'info': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    const actionButtonClasses = "font-semibold py-2 px-4 rounded-lg transition-colors shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="max-w-7xl mx-auto">
            <header className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-blue-400">Trình Chuyển Đổi JSON</h1>
                <p className="text-lg text-gray-400 mt-2">Chuyển đổi, định dạng và tương tác với JSON bằng AI.</p>
            </header>

            <div className="flex justify-center items-center gap-2 md:gap-3 my-6 flex-wrap">
                <button onClick={handleEscape} disabled={isLoading} className={`${actionButtonClasses} bg-blue-600 hover:bg-blue-700 text-white`}><EscapeIcon />Escape</button>
                <button onClick={handleUnescape} disabled={isLoading} className={`${actionButtonClasses} bg-green-600 hover:bg-green-700 text-white`}><UnescapeIcon />Unescape</button>
                <button onClick={() => runGeminiAction(generateJson, input, "Đã tạo JSON thành công! ✨")} disabled={isLoading} className={`${actionButtonClasses} bg-indigo-600 hover:bg-indigo-700 text-white`}><GeminiIcon />Tạo</button>
                <button onClick={() => runGeminiAction(fixJson, input, "Đã sửa lỗi JSON thành công! ✨")} disabled={isLoading} className={`${actionButtonClasses} bg-indigo-600 hover:bg-indigo-700 text-white`}><GeminiIcon />Sửa lỗi</button>
                <button onClick={() => runGeminiAction(explainJson, input, "Đã giải thích JSON thành công! ✨")} disabled={isLoading} className={`${actionButtonClasses} bg-indigo-600 hover:bg-indigo-700 text-white`}><GeminiIcon />Giải thích</button>
                <button onClick={handleSwap} disabled={isLoading} className={`${actionButtonClasses} bg-gray-600 hover:bg-gray-700 text-white px-3`}><SwapIcon /></button>
                <button onClick={handleClear} disabled={isLoading} className={`${actionButtonClasses} bg-red-600 hover:bg-red-700 text-white px-3`}><ClearIcon /></button>
            </div>

            <div id="statusMessage" className={`text-center h-6 mb-4 font-medium transition-opacity duration-300 ${status ? 'opacity-100' : 'opacity-0'} ${status ? getStatusColor(status.type) : ''}`}>
                {status?.message}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="inputArea" className="block text-sm font-medium text-gray-300">Đầu vào</label>
                        <button 
                          onClick={() => handleFormat(input, setInput, isPrettyInput, () => setIsPrettyInput(p => !p), 'đầu vào')}
                          className="text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors"
                        >
                            Định dạng: {isPrettyInput ? 'Đẹp' : 'Gọn'}
                        </button>
                    </div>
                    <textarea 
                        id="inputArea"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full min-h-[600px] lg:min-h-[800px] p-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-100 font-mono focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors"
                        placeholder="Dán JSON, chuỗi, hoặc mô tả để tạo JSON..."
                    />
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="outputArea" className="block text-sm font-medium text-gray-300">Đầu ra</label>
                         <button 
                          onClick={() => handleFormat(output, setOutput, isPrettyOutput, () => setIsPrettyOutput(p => !p), 'đầu ra')}
                          className="text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors"
                        >
                            Định dạng: {isPrettyOutput ? 'Đẹp' : 'Gọn'}
                        </button>
                    </div>
                    <textarea 
                        id="outputArea"
                        value={output}
                        readOnly
                        className="w-full min-h-[600px] lg:min-h-[800px] p-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-100 font-mono focus:border-gray-700 focus:ring-0 outline-none"
                        placeholder="Kết quả sẽ xuất hiện ở đây..."
                    />
                </div>
            </div>
        </div>
    );
};

export default JsonConverter;
