import { useState, useEffect } from "react";
import cn from "classnames";
import styles from "../DemoA.module.sass";

type ToastMessage = {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'success' | 'info';
};

const DecodeKeyFromCredits = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDecoding, setIsDecoding] = useState(false);
    const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [recoverySettings, setRecoverySettings] = useState<any>(null);
    const [passwordInput, setPasswordInput] = useState("");
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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

            // Create preview URL for the selected video
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
        }
    };

    const handleDecode = async () => {
        if (!selectedFile) {
            showToast("Please select a video to reveal", 'warning');
            return;
        }

                        setIsDecoding(true);
        const formData = new FormData();
        // Use the correct video parameter for video steganography API
        formData.append("video", selectedFile);

        try {
            const response = await fetch(`${BACKEND_URL}/api/video-steganography/decode`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                setDecodedMessage(result.message);
                showToast("Message revealed successfully!", 'success');

                // Video steganography doesn't have these settings yet, so we'll keep this simple
                setRecoverySettings({
                    passwordProtected: false,
                    requireWorldID: false,
                    duressMode: false,
                    requirePayment: false,
                });
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

    // Check if decoded message contains 12 words (BIP-39 format)
    const is12WordPhrase = decodedMessage && decodedMessage.trim().split(' ').length === 12;
    const decodedWords = is12WordPhrase ? decodedMessage.trim().split(' ') : [];

    // Cleanup video URL on component unmount
    useEffect(() => {
        return () => {
            if (videoPreview) {
                URL.revokeObjectURL(videoPreview);
            }
        };
    }, [videoPreview]);

    return (
        <>
            <div className={styles.section}>
                <div className={styles.wrap}>
                    <div className={cn("h2", styles.title)}>Reveal Data From Credit Scene</div>
                    <div className={cn("h5M", styles.info)}>
                        Extract hidden keys from steganography video files
                    </div>

                    <div className={styles.uploadArea} onClick={() => document.getElementById('reveal-video-file')?.click()}>
                        {selectedFile ? (
                            <span>Selected: {selectedFile.name}</span>
                        ) : (
                            <span>Click to upload stego video</span>
                        )}
                        <input
                            id="reveal-video-file"
                            type="file"
                            accept="video/*"
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
                            <h4 className={styles.cardTitle}>Selected Video</h4>
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
                            {videoPreview ? (
                                <video
                                    src={videoPreview}
                                    controls
                                    className={styles.cardImage}
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <div className={styles.placeholderContent}>
                                    <span>Selected video will appear here</span>
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
                                                    Password Protected - {recoverySettings.passwordProtected ? "Yes" : "No"}
                                                </div>
                                                <div className={styles.settingBox}>
                                                    Require Payment - {recoverySettings.requireWorldID ? "Yes" : "No"}
                                                </div>
                                                {recoverySettings.duressMode && (
                                                    <div className={styles.settingBox}>
                                                        Duress Mode - Yes
                                                    </div>
                                                )}
                                                {recoverySettings.requirePayment && (
                                                    <div className={styles.settingBox}>
                                                        Require Payment - Yes
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
                                                        <span className={styles.wordText}>{word}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className={styles.decodedText}>{decodedMessage}</div>
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

export default DecodeKeyFromCredits;