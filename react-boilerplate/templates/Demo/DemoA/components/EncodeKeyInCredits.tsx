import { useState } from "react";
import cn from "classnames";
import styles from "../DemoA.module.sass";
import SettingsModal from "@/components/SettingsModal";

type ToastMessage = {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'success' | 'info';
};

type EncodeKeyInCreditsProps = {
    wordTypes: string[];
};

const EncodeKeyInCredits = ({
    wordTypes,
}: EncodeKeyInCreditsProps) => {
    const [inputMode, setInputMode] = useState<"free" | "words" | "image">("free");
    const [seedPhrase, setSeedPhrase] = useState("");
    const [wordInputs, setWordInputs] = useState(Array(12).fill(""));
    const [wordType, setWordType] = useState("original");
    const [uploadMethod, setUploadMethod] = useState<"upload" | "demo">("upload");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedDemoVideo, setSelectedDemoVideo] = useState("");
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [secretImage, setSecretImage] = useState<File | null>(null);
    const [secretImagePreview, setSecretImagePreview] = useState<string | null>(null);

    const [encodedImage, setEncodedImage] = useState<string | null>(null);
    const [isEncoding, setIsEncoding] = useState(false);
    const [mnemonicHidden, setMnemonicHidden] = useState(false); // Default to visible/not blurred
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Settings state
    const [settings, setSettings] = useState({
        passwordProtected: false,
        duressMode: false,
        requireWorldID: false,
        timestampVerification: false,
        multiLayerEncryption: false,
        decoyData: false,
        autoDestruct: false,
    });

    // Demo video options
    const demoVideos = [
        { title: "Casino Royale Credits", filename: "casino_royale_credits.mp4" },
        { title: "Pulp Fiction End Credits", filename: "pulp_fiction_credits.mp4" },
        { title: "The Matrix Credits", filename: "matrix_credits.mp4" },
        { title: "Inception End Sequence", filename: "inception_credits.mp4" },
        { title: "Cannes Festival Credits", filename: "cannes_festival_credits.mp4" }
    ];

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const showToast = (message: string, type: ToastMessage['type'] = 'error') => {
        const id = Date.now().toString();
        const newToast: ToastMessage = { id, message, type };
        setToasts(prev => [...prev, newToast]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Create preview URL for the selected video
            const reader = new FileReader();
            reader.onload = (event) => {
                setOriginalImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDemoVideoChange = (videoTitle: string) => {
        setSelectedDemoVideo(videoTitle);
        const selectedVideo = demoVideos.find(video => video.title === videoTitle);
        if (selectedVideo) {
            // Set preview to demo video path
            setOriginalImagePreview(`/demo-videos/${selectedVideo.filename}`);
            setSelectedFile(null); // Clear uploaded file when using demo
        }
    };

    const handleSecretImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSecretImage(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setSecretImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleWordChange = (index: number, value: string) => {
        const newWords = [...wordInputs];
        newWords[index] = value;
        setWordInputs(newWords);
    };

    const handleSettingToggle = (settingKey: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [settingKey]: !prev[settingKey]
        }));
    };

    const handleEncode = async () => {
        let phrase = "";
        if (inputMode === "free") {
            phrase = seedPhrase;
        } else if (inputMode === "words") {
            phrase = wordInputs.join(" ");
        } else if (inputMode === "image") {
            phrase = "";
        }

        // Validation with toast notifications
        const errors: string[] = [];

        if (inputMode === "free" && !phrase.trim()) {
            errors.push("Please enter a seed phrase or mnemonic words");
        }
        if (inputMode === "words" && !phrase.trim()) {
            errors.push("Please enter mnemonic words");
        }
        if (inputMode === "image" && !secretImage) {
            errors.push("Please select a secret image to hide");
        }

        // Check if video is selected (either uploaded or demo)
        if (uploadMethod === "upload" && !selectedFile) {
            errors.push("Please select a video to upload");
        }
        if (uploadMethod === "demo" && !selectedDemoVideo) {
            errors.push("Please select a demo video from the dropdown");
        }

        // Show errors as toasts and return early if validation fails
        if (errors.length > 0) {
            errors.forEach(error => showToast(error, 'warning'));
            return;
        }

        setIsEncoding(true);
        const formData = new FormData();

        // Use the correct video file parameter for video steganography API
        if (uploadMethod === "upload" && selectedFile) {
            formData.append("video", selectedFile);
        } else if (uploadMethod === "demo" && selectedDemoVideo) {
            // For demo videos, we'll need to handle this differently
            // For now, show error as demo videos aren't supported yet
            showToast("Demo videos not yet supported. Please upload a video file.", 'warning');
            setIsEncoding(false);
            return;
        }

        if (inputMode === "image" && secretImage) {
            formData.append("secretImage", secretImage);
        } else {
            formData.append("message", phrase);
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/video-steganography/encode`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                // Create download URL for the encoded video
                const videoUrl = `${BACKEND_URL}${result.url}`;
                setEncodedImage(videoUrl);
                showToast(`Video processed successfully! Hidden message in ${result.framesUsed}/${result.totalFrames} frames.`, 'success');
            } else {
                showToast(result.error || "Failed to process video", 'error');
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("Error connecting to backend. Please try again.", 'error');
        } finally {
            setIsEncoding(false);
        }
    };

    const handleDownloadEncoded = () => {
        if (encodedImage) {
            const link = document.createElement('a');
            link.href = encodedImage;
            link.download = 'hidden-video.mp4';
            link.click();
            showToast("Video downloaded successfully!", 'success');
        }
    };



    // Sample word lists for generation
    const generateFreeText = () => {
        const sampleTexts = [
            "The quick brown fox jumps over the lazy dog",
            "To be or not to be, that is the question",
            "In a hole in the ground there lived a hobbit",
            "It was the best of times, it was the worst of times",
            "Call me Ishmael. Some years ago..."
        ];
        setSeedPhrase(sampleTexts[Math.floor(Math.random() * sampleTexts.length)]);
    };

    const generateDefaultWords = () => {
        const bipWords = ["abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access", "accident"];
        const randomWords = Array.from({ length: 12 }, () => bipWords[Math.floor(Math.random() * bipWords.length)]);
        setWordInputs(randomWords);
    };

    const generateMovieWords = () => {
        const movieWords = ["pulp", "fiction", "taxi", "driver", "godfather", "casino", "goodfellas", "scarface", "matrix", "inception", "avatar", "titanic"];
        const randomWords = Array.from({ length: 12 }, () => movieWords[Math.floor(Math.random() * movieWords.length)]);
        setWordInputs(randomWords);
    };

    const generateFrenchWords = () => {
        const frenchWords = ["abandonner", "abaisser", "abattre", "abdomen", "abeille", "abolir", "aborder", "aboutir", "aboyer", "abrasif", "abreuver", "abriter"];
        const randomWords = Array.from({ length: 12 }, () => frenchWords[Math.floor(Math.random() * frenchWords.length)]);
        setWordInputs(randomWords);
    };

    const generateChineseWords = () => {
        const chineseWords = ["的", "一", "是", "在", "不", "了", "有", "和", "人", "这", "中", "大"];
        const randomWords = Array.from({ length: 12 }, () => chineseWords[Math.floor(Math.random() * chineseWords.length)]);
        setWordInputs(randomWords);
    };
    return (
        <>
            <div className={styles.section}>
                <div className={styles.wrap}>
                    <div className={cn("h2", styles.title)}>Hide Data In Credit Scene</div>
                    <div className={cn("h5M", styles.info)}>
                        Hide your secrets inside movie credit scenes using advanced video steganography
                    </div>

                    {/* Input Mode Selection with Generation Icons */}
                    <div className={styles.inputModeSelectContainer}>
                        <div className={styles.inputModeSelect}>
                            <label>
                                <input
                                    type="radio"
                                    name="creditInputMode"
                                    value="free"
                                    checked={inputMode === "free"}
                                    onChange={(e) => {
                                        setInputMode(e.target.value as "free" | "words" | "image");
                                        setMnemonicHidden(false);
                                    }}
                                />
                                Free Input
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="creditInputMode"
                                    value="words"
                                    checked={inputMode === "words"}
                                    onChange={(e) => {
                                        setInputMode(e.target.value as "free" | "words" | "image");
                                        setMnemonicHidden(false);
                                    }}
                                />
                                Mnemonic Phrase
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="creditInputMode"
                                    value="image"
                                    checked={inputMode === "image"}
                                    onChange={(e) => {
                                        setInputMode(e.target.value as "free" | "words" | "image");
                                        setMnemonicHidden(false);
                                    }}
                                />
                                Secret Image
                            </label>
                        </div>

                        <div className={styles.generationIcons}>
                            {inputMode === "free" ? (
                                <>
                                    <button
                                        type="button"
                                        className={styles.iconButton}
                                        onClick={() => setMnemonicHidden(!mnemonicHidden)}
                                        title={mnemonicHidden ? "Show secret text" : "Hide secret text"}
                                    >
                                        {mnemonicHidden ? "👁️‍🗨️" : "👁️"}
                                    </button>
                                    <button
                                        className={styles.iconButton}
                                        onClick={generateFreeText}
                                        title="Generate sample text"
                                    >
                                        ✨
                                    </button>
                                </>
                            ) : inputMode === "words" ? (
                                <>
                                    <button
                                        type="button"
                                        className={styles.iconButton}
                                        onClick={() => setMnemonicHidden(!mnemonicHidden)}
                                        title={mnemonicHidden ? "Show mnemonic phrase" : "Hide mnemonic phrase"}
                                    >
                                        {mnemonicHidden ? "👁️‍🗨️" : "👁️"}
                                    </button>
                                    <button
                                        className={styles.iconButton}
                                        onClick={generateDefaultWords}
                                        title="Generate BIP-39 words"
                                    >
                                        ✨
                                    </button>
                                    <button
                                        className={styles.iconButton}
                                        onClick={generateMovieWords}
                                        title="Generate movie-related words"
                                    >
                                        🎬
                                    </button>
                                    <button
                                        className={styles.iconButton}
                                        onClick={generateFrenchWords}
                                        title="Generate French words"
                                    >
                                        🇫🇷
                                    </button>
                                    <button
                                        className={styles.iconButton}
                                        onClick={generateChineseWords}
                                        title="Generate Chinese words"
                                    >
                                        🇨🇳
                                    </button>
                                </>
                            ) : inputMode === "image" ? (
                                <>
                                    <button
                                        className={styles.iconButton}
                                        onClick={() => setMnemonicHidden(!mnemonicHidden)}
                                        title={mnemonicHidden ? "Show secret image" : "Hide secret image"}
                                    >
                                        {mnemonicHidden ? "👁️‍🗨️" : "👁️"}
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {/* Input Fields */}
                    {inputMode === "free" ? (
                        <textarea
                            className={cn(styles.seedInput, {
                                [styles.hiddenInput]: mnemonicHidden
                            })}
                            placeholder="Enter your secret key"
                            value={seedPhrase}
                            onChange={(e) => setSeedPhrase(e.target.value)}
                            rows={3}
                        />
                    ) : inputMode === "words" ? (
                        <div className={styles.wordGrid}>
                            {wordInputs.map((word, index) => (
                                <div key={index} className={styles.wordInput}>
                                    <span>{index + 1}.</span>
                                    <input
                                        type="text"
                                        placeholder={`Word ${index + 1}`}
                                        value={word}
                                        onChange={(e) => handleWordChange(index, e.target.value)}
                                        className={cn({
                                            [styles.hiddenInput]: mnemonicHidden
                                        })}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : inputMode === "image" ? (
                        <div style={{ margin: '16px 0' }}>
                            <div className={styles.uploadArea} onClick={() => document.getElementById('secret-image-file')?.click()}>
                                {secretImagePreview ? (
                                    <img src={secretImagePreview} alt="Secret to hide" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }} />
                                ) : (
                                    <span>Click to upload secret image</span>
                                )}
                                <input
                                    id="secret-image-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleSecretImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                    ) : null}

                    {/* Upload Method Selection */}
                    <div className={styles.uploadMethodSelectContainer}>
                        <div className={styles.uploadMethodSelect}>
                            <label>
                                <input
                                    type="radio"
                                    name="videoUploadMethod"
                                    value="upload"
                                    checked={uploadMethod === "upload"}
                                    onChange={(e) => {
                                        setUploadMethod(e.target.value as "upload" | "demo");
                                        setOriginalImagePreview(null);
                                        setSelectedFile(null);
                                        setSelectedDemoVideo("");
                                    }}
                                />
                                Upload Video
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="videoUploadMethod"
                                    value="demo"
                                    checked={uploadMethod === "demo"}
                                    onChange={(e) => {
                                        setUploadMethod(e.target.value as "upload" | "demo");
                                        setOriginalImagePreview(null);
                                        setSelectedFile(null);
                                        setSelectedDemoVideo("");
                                    }}
                                />
                                Use Demo Video
                            </label>
                        </div>
                    </div>

                    {/* Video Upload/Selection */}
                    {uploadMethod === "upload" ? (
                        <div className={styles.uploadArea} onClick={() => document.getElementById('hide-video-file')?.click()}>
                            {selectedFile ? (
                                <span>Selected: {selectedFile.name}</span>
                            ) : (
                                <span>Click to upload credit scene video</span>
                            )}
                            <input
                                id="hide-video-file"
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    ) : (
                        <div className={styles.dropdownSection}>
                            <select
                                value={selectedDemoVideo}
                                onChange={(e) => handleDemoVideoChange(e.target.value)}
                                className={styles.dropdown}
                            >
                                <option value="">Select Demo Video</option>
                                {demoVideos.map(video => (
                                    <option key={video.filename} value={video.title}>
                                        {video.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.cardsSection}>
                <div className={styles.imageCard}>
                    <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                            <h4 className={styles.cardTitle}>Original Video</h4>
                            <div className={styles.headerActions}>
                                <button
                                    className={styles.iconButton}
                                    onClick={() => setShowSettingsModal(true)}
                                    title="Encryption settings"
                                >
                                    ⚙️
                                </button>
                                <button
                                    className={cn("button", styles.headerButton)}
                                    onClick={handleEncode}
                                    disabled={isEncoding}
                                >
                                    {isEncoding ? "Processing..." : "Process Video"}
                                </button>
                            </div>
                        </div>
                        <div className={styles.imagePreviewArea}>
                            {originalImagePreview ? (
                                <video src={originalImagePreview} className={styles.cardImage} controls />
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
                            <h4 className={styles.cardTitle}>Processed Video</h4>
                            <button
                                className={cn("button", styles.headerButton, {
                                    [styles.disabled]: !encodedImage
                                })}
                                onClick={handleDownloadEncoded}
                                disabled={!encodedImage}
                            >
                                Download
                            </button>
                        </div>
                        <div className={styles.imagePreviewArea}>
                            {encodedImage ? (
                                <video src={encodedImage} className={styles.cardImage} controls />
                            ) : (
                                <div className={styles.placeholderContent}>
                                    <span>Processed video will appear here</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            <SettingsModal
                visible={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                settings={settings}
                onSettingToggle={handleSettingToggle}
            />

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

export default EncodeKeyInCredits;