
import React, { useState, useCallback } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

type StatusType = 'error' | 'success' | 'info';

const MerchantConfig: React.FC = () => {
    const [merchantId, setMerchantId] = useState('');
    const [merchantName, setMerchantName] = useState('');
    const [checks, setChecks] = useState({
        recon: false,
        galaxyPay: false,
        ibft: false,
    });
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState<{ message: string; type: StatusType } | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const showStatus = (message: string, type: StatusType) => {
        setStatus({ message, type });
        setTimeout(() => setStatus(null), 3000);
    };

    const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setChecks(prev => ({ ...prev, [name]: checked }));
    };

    const generateConfig = useCallback(() => {
        if (!merchantId || !merchantName) {
            showStatus('Lỗi: Vui lòng nhập đầy đủ MerchantID và MerchantName.', 'error');
            setOutput('');
            return;
        }

        let results: string[] = [];

        if (checks.recon) {
            const reconJson = {
                "group_type": "MERCHANT", "partner_id": merchantName, "partner_name": merchantName,
                "merchant_id": [merchantId],
                "method": ["GALAXYPAY", "MOMO", "VIETTEL", "ZALOPAY", "NAPAS", "VN_INT_CARD", "OUT_INT_CARD", "QRPAY"],
                "channel": "PaymentGateway", "service": ["PAYMENT", "REFUND"], "status": "ACTIVE"
            };
            results.push("--- 1. Cấu hình đối soát (reconciliation_partner) ---\n" + JSON.stringify(reconJson, null, 2));
        }

        if (checks.galaxyPay) {
            results.push(`--- 2. Cấu hình Danh sách merchant có giao dịch GalaxyPay ---\nMySQL-Operation\nems/ system_param\nparam_id = "WALLET_MERCHANTS"\n{"id":"${merchantId}","title":"${merchantName}"}`);
        }

        if (checks.ibft) {
            results.push(`--- 3. Danh sách merchant trong báo cáo IBFT ---\nMySQL-Operation\nems/ system_param\nparam_id = IBFT_VCCB_SEARCH_MERCHANT\n{"id":"${merchantName}","title":"${merchantName}"}`);
        }

        if (results.length === 0) {
            showStatus('Vui lòng chọn ít nhất một mục để tạo cấu hình.', 'info');
            setOutput('');
        } else {
            setOutput(results.join('\n\n==================================================\n\n'));
            showStatus('Đã tạo cấu hình thành công!', 'success');
        }
    }, [merchantId, merchantName, checks]);

    const handleCopy = useCallback(() => {
        if (!output) {
            showStatus('Không có gì để sao chép!', 'error');
            return;
        }
        navigator.clipboard.writeText(output).then(() => {
            showStatus('Đã sao chép vào clipboard!', 'success');
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }, () => {
            showStatus('Lỗi: Không thể sao chép tự động.', 'error');
        });
    }, [output]);

    const getStatusColor = (type: StatusType) => {
        switch (type) {
            case 'error': return 'text-red-400';
            case 'success': return 'text-green-400';
            case 'info': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };
    
    return (
        <div className="max-w-7xl mx-auto">
            <header className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-teal-400">Cấu hình merchant Cổng sau khi go-live</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label htmlFor="merchantIdInput" className="block text-sm font-medium text-gray-300 mb-2">MerchantID</label>
                    <input type="text" id="merchantIdInput" value={merchantId} onChange={e => setMerchantId(e.target.value)}
                        className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-100 font-mono focus:border-teal-500 focus:ring-teal-500 outline-none transition-colors"
                        placeholder="Ví dụ: 1044" />
                </div>
                <div>
                    <label htmlFor="merchantNameInput" className="block text-sm font-medium text-gray-300 mb-2">MerchantName</label>
                    <input type="text" id="merchantNameInput" value={merchantName} onChange={e => setMerchantName(e.target.value)}
                        className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-100 font-mono focus:border-teal-500 focus:ring-teal-500 outline-none transition-colors"
                        placeholder="Ví dụ: SFYFI" />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Các item cần thực hiện</label>
                <div className="space-y-3">
                    <div className="flex items-center">
                        <input id="checkRecon" name="recon" type="checkbox" checked={checks.recon} onChange={handleCheckChange} />
                        <label htmlFor="checkRecon" className="ml-3 text-sm font-medium text-gray-300 select-none">1. Cấu hình đối soát (reconciliation_partner)</label>
                    </div>
                    <div className="flex items-center">
                        <input id="checkGalaxyPay" name="galaxyPay" type="checkbox" checked={checks.galaxyPay} onChange={handleCheckChange} />
                        <label htmlFor="checkGalaxyPay" className="ml-3 text-sm font-medium text-gray-300 select-none">2. Cấu hình Danh sách merchant có giao dịch GalaxyPay (WALLET_MERCHANTS)</label>
                    </div>
                    <div className="flex items-center">
                        <input id="checkIBFT" name="ibft" type="checkbox" checked={checks.ibft} onChange={handleCheckChange} />
                        <label htmlFor="checkIBFT" className="ml-3 text-sm font-medium text-gray-300 select-none">3. Danh sách merchant trong báo cáo IBFT (IBFT_VCCB_SEARCH_MERCHANT)</label>
                    </div>
                </div>
            </div>

            <div className="text-center my-6">
                <button onClick={generateConfig} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg text-lg">
                    Tạo Cấu Hình
                </button>
            </div>

            <div className={`text-center h-6 mb-4 font-medium transition-opacity duration-300 ${status ? 'opacity-100' : 'opacity-0'} ${status ? getStatusColor(status.type) : ''}`}>
                {status?.message}
            </div>

            <div>
                <label htmlFor="configOutputArea" className="block text-sm font-medium text-gray-300 mb-2">Kết quả cấu hình</label>
                <div className="relative">
                    <textarea id="configOutputArea" value={output} readOnly
                        className="w-full min-h-[400px] p-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-100 font-mono focus:border-gray-700 focus:ring-0 outline-none"
                        placeholder="Kết quả cấu hình sẽ xuất hiện ở đây..."></textarea>
                    <button onClick={handleCopy} title="Copy to clipboard" className="absolute top-3 right-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold p-2 rounded-lg transition-colors shadow-md text-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400">
                       {copySuccess ? <CheckIcon /> : <CopyIcon />}
                    </button>
                </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
                <p className="font-bold mb-2">Nhắc nhở quan trọng:</p>
                <p>Vui lòng kiểm tra lại các hạng mục khác có thể cần cấu hình thêm (nếu có):</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Phí phải thu merchant</li>
                    <li>Phí phải trả provider</li>
                    <li>SBV Report Quarterly/Yearly</li>
                    <li>HDBANK_MPGS: Báo anh Chung add MID mới vào báo cáo đối soát của GP</li>
                </ul>
            </div>
        </div>
    );
};

export default MerchantConfig;
