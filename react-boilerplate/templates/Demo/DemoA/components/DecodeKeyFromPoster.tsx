import { useState, useEffect } from "react";
import cn from "classnames";
import styles from "../DemoA.module.sass";

type ToastMessage = {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'success' | 'info';
};

const FLOW_EVM_PARAMS = {
    chainId: '0x221', // 545 in hex
    chainName: 'Flow EVM Testnet',
    nativeCurrency: {
        name: 'Flow',
        symbol: 'FLOW',
        decimals: 18,
    },
    rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
    blockExplorerUrls: ['https://evm-testnet.flowscan.io'],
};
const CONTRACT_ADDRESS = '0xe2813e30B0F3CDD5534db2fBD649FAc432b29502';

// Add this type for window.ethereum
// @ts-ignore
// eslint-disable-next-line
declare global {
    interface Window {
        ethereum?: any;
    }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const DecodeKeyFromPoster = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDecoding, setIsDecoding] = useState(false);
    const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [recoverySettings, setRecoverySettings] = useState<any>(null);
    const [passwordInput, setPasswordInput] = useState("");
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [requirePayment, setRequirePayment] = useState(false);
    const [paymentInProgress, setPaymentInProgress] = useState(false);
    const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

    const showToast = (message: string, type: ToastMessage['type'] = 'error') => {
        const id = Date.now().toString();
        const newToast: ToastMessage = { id, message, type };
        setToasts(prev => [...prev, newToast]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Create preview URL for the selected image
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDecode = async () => {
        if (!selectedFile) {
            showToast("Please select an image to reveal", 'warning');
            return;
        }

        setIsDecoding(true);
        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            const response = await fetch(`${BACKEND_URL}/api/steganography/decode`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                setDecodedMessage(result.message);
                showToast("Message revealed successfully!", 'success');

                // Simulate recovery settings from the encoded data
                setRecoverySettings({
                    passwordProtected: result.settings?.passwordProtected || false,
                    requireWorldID: result.settings?.requireWorldID || false,
                    duressMode: result.settings?.duressMode || false,
                    requirePayment: result.settings?.requirePayment || false,
                });

                // Check if password is required
                if (result.settings?.passwordProtected && !passwordInput) {
                    setShowPasswordInput(true);
                    setDecodedMessage(null);
                    showToast("This image is password protected. Please enter the password.", 'info');
                }
            } else {
                showToast("Revealing failed. Please try again.", 'error');
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("Error connecting to backend. Please check your connection.", 'error');
        } finally {
            setIsDecoding(false);
        }
    };

    async function connectAndSwitchNetwork() {
        if (!window.ethereum) throw new Error('MetaMask not found');
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: FLOW_EVM_PARAMS.chainId }],
            });
        } catch (switchError) {
            if ((switchError as any).code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [FLOW_EVM_PARAMS],
                });
            } else {
                throw switchError;
            }
        }
    }

    async function sendPayment(amountEth = '0.01') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const from = accounts[0];
        // Convert to hex (wei)
        const value = (BigInt(Math.floor(Number(amountEth) * 1e18))).toString(16);
        const tx = {
            from,
            to: CONTRACT_ADDRESS,
            value: '0x' + value,
        };
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [tx],
        });
        return txHash as string;
    }

    const handlePayment = async () => {
        setPaymentInProgress(true);
        setWaitingForConfirmation(false);
        try {
            await connectAndSwitchNetwork();
            const txHash = await sendPayment('0.01');
            showToast('Payment sent! Waiting for confirmation...', 'info');
            setWaitingForConfirmation(true);
            await waitForTxConfirmation(txHash);
            // Wait 2 seconds after confirmation
            await new Promise(res => setTimeout(res, 2000));
            setRequirePayment(false); // Unblur secret
            showToast('Payment confirmed! Secret revealed.', 'success');
        } catch (err) {
            showToast('Payment failed, cancelled, or not confirmed.', 'error');
        }
        setWaitingForConfirmation(false);
        setPaymentInProgress(false);
    };

    async function waitForTxConfirmation(txHash: string, timeout = 60000, interval = 3000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const res = await fetch('https://testnet.evm.nodes.onflow.org', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_getTransactionReceipt',
                    params: [txHash],
                    id: 1,
                }),
            });
            const data = await res.json();
            if (data.result && data.result.status === '0x1') {
                return true;
            }
            await new Promise(r => setTimeout(r, interval));
        }
        throw new Error('Transaction not confirmed in time');
    }

    // Check if decoded message contains 12 words (BIP-39 format)
    const is12WordPhrase = decodedMessage && decodedMessage.trim().split(' ').length === 12;
    const decodedWords = is12WordPhrase ? decodedMessage.trim().split(' ') : [];

    // Cleanup image URL on component unmount
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <>
            <div className={styles.section}>
                <div className={styles.wrap}>
                    <div className={cn("h2", styles.title)}>Reveal Data From Poster</div>
                    <div className={cn("h5M", styles.info)}>
                        Extract hidden keys from steganography poster images
                    </div>

                    <div className={styles.uploadArea} onClick={() => document.getElementById('reveal-poster-file')?.click()}>
                        {selectedFile ? (
                            <span>Selected: {selectedFile.name}</span>
                        ) : (
                            <span>Click to upload stego poster</span>
                        )}
                        <input
                            id="reveal-poster-file"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Password Input Section */}
                    {showPasswordInput && (
                        <div className={styles.passwordSection}>
                            <input
                                type="password"
                                placeholder="Enter password to reveal"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className={styles.passwordInput}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.cardsSection}>
                <div className={styles.imageCard}>
                    <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                            <h4 className={styles.cardTitle}>Secret Image</h4>
                            <button
                                className={cn("button", styles.headerButton, {
                                    [styles.disabled]: isDecoding
                                })}
                                onClick={handleDecode}
                                disabled={isDecoding}
                            >
                                {isDecoding ? "Revealing..." : "Reveal Message"}
                            </button>
                        </div>
                        <div className={styles.imagePreviewArea}>
                            {imagePreview ? (
                                <img src={imagePreview} alt="Selected for revealing" className={styles.cardImage} />
                            ) : (
                                <div className={styles.placeholderContent}>
                                    <span>Selected image will appear here</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.imageCard}>
                    <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                            <h4 className={styles.cardTitle}>Revealed Result</h4>
                        </div>
                        <div className={styles.imagePreviewArea}>
                            {decodedMessage ? (
                                <div className={styles.decodedResult}>
                                    {/* Recovery Settings */}
                                    {recoverySettings && (
                                        <div className={styles.recoverySettings}>
                                            <h4 className={styles.recoveryTitle}>Recover Settings</h4>
                                            <div className={styles.settingsGrid}>
                                                <div className={styles.settingBox}>
                                                    Require Password - {recoverySettings.requireWorldID ? "Yes" : "No"}
                                                </div>
                                                <div
                                                    className={styles.settingBox}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                    onClick={() => setRequirePayment((v) => !v)}
                                                >
                                                    Require Payment - {requirePayment ? "Yes" : "No"}
                                                </div>
                                                {recoverySettings.duressMode && (
                                                    <div className={styles.settingBox}>
                                                        Duress Mode - Yes
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recovered Message Section */}
                                    <div className={styles.recoveredKeySection}>
                                        <h4 className={styles.recoveredKeyTitle}>Recovered Message:</h4>
                                        {is12WordPhrase ? (
                                            <div className={styles.decodedWordsGrid}>
                                                {decodedWords.map((word, index) => (
                                                    <div key={index} className={styles.decodedWordItem}>
                                                        <span className={styles.wordNumber}>{index + 1}.</span>
                                                        <span
                                                            className={styles.wordText}
                                                            style={requirePayment ? { filter: 'blur(6px)' } : {}}
                                                        >
                                                            {word}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div
                                                className={styles.decodedText}
                                                style={requirePayment ? { filter: 'blur(8px)' } : {}}
                                            >
                                                {decodedMessage}
                                            </div>
                                        )}
                                        {requirePayment && (
                                            <div style={{ width: '100%' }}>
                                                <button
                                                    className={styles.button}
                                                    style={{ marginTop: 16, width: '100%' }}
                                                    onClick={handlePayment}
                                                    disabled={paymentInProgress || waitingForConfirmation}
                                                >
                                                    {paymentInProgress
                                                        ? 'Processing Payment...'
                                                        : waitingForConfirmation
                                                            ? 'Waiting for Confirmation...'
                                                            : 'Make Payment to Reveal'}
                                                </button>
                                                {waitingForConfirmation && (
                                                    <div style={{ marginTop: 12, textAlign: 'center', color: '#888' }}>
                                                        Waiting for transaction confirmation...
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.placeholderContent}>
                                    <span>Revealed message will appear here</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            <div className={styles.toastContainer}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={cn(styles.toast, styles[`toast-${toast.type}`])}
                        onClick={() => removeToast(toast.id)}
                    >
                        <div className={styles.toastContent}>
                            <span className={styles.toastIcon}>
                                {toast.type === 'error' && '❌'}
                                {toast.type === 'warning' && '⚠️'}
                                {toast.type === 'success' && '✅'}
                                {toast.type === 'info' && 'ℹ️'}
                            </span>
                            <span className={styles.toastMessage}>{toast.message}</span>
                        </div>
                        <button
                            className={styles.toastClose}
                            onClick={(e) => {
                                e.stopPropagation();
                                removeToast(toast.id);
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
};

export default DecodeKeyFromPoster;