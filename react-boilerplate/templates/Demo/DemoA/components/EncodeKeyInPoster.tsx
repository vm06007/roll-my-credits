import { useState, useEffect, useRef } from "react";
import cn from "classnames";
import styles from "../DemoA.module.sass";
import SettingsModal from "@/components/SettingsModal";

type EncodeKeyInPosterProps = {
    movies: string[];
    styles_options: string[];
    wordTypes: string[];
};

type ToastMessage = {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'success' | 'info';
};

const EncodeKeyInPoster = ({
    movies,
    styles_options,
    wordTypes,
}: EncodeKeyInPosterProps) => {
    const [inputMode, setInputMode] = useState<"free" | "words">("free");
    const [seedPhrase, setSeedPhrase] = useState("");
    const [wordInputs, setWordInputs] = useState(Array(12).fill(""));
    const [wordType, setWordType] = useState("original");
    const [uploadMethod, setUploadMethod] = useState<"upload" | "dropdown">("upload");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedMovie, setSelectedMovie] = useState("");
    const [selectedStyle, setSelectedStyle] = useState("");
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [encodedImage, setEncodedImage] = useState<string | null>(null);
    const [isEncoding, setIsEncoding] = useState(false);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [posterStyleFilter, setPosterStyleFilter] = useState("ghibli"); // Default to "ghibli" style
    const [movieFilter, setMovieFilter] = useState("all"); // Default to show all movies

    // Toast notification state
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [mnemonicHidden, setMnemonicHidden] = useState(false); // Default to visible/not blurred

    // Ref to store scroll position when modal opens
    const scrollPositionRef = useRef(0);

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

    // Toast notification functions
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
                setOriginalImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleWordChange = (index: number, value: string) => {
        const newWords = [...wordInputs];
        newWords[index] = value;
        setWordInputs(newWords);
    };

    const handleMovieStyleChange = (movie: string, style: string) => {
        if (movie && style) {
            // Find the movie in our categories and get the appropriate style
            const movieData = masterMovieList.find(m => m.title === movie);
            const styleData = getStyleByTitle(style);
            if (movieData && styleData) {
                const imagePath = `/posters/${styleData.folder}/${movieData.filename}${styleData.extension}`;
                setOriginalImagePreview(imagePath);
            }
        }
    };

    const handleSettingToggle = (settingKey: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [settingKey]: !prev[settingKey]
        }));
    };

    const validateInputs = () => {
        const errors: string[] = [];

        // Check if secret key is provided
        if (inputMode === "free") {
            if (!seedPhrase.trim()) {
                errors.push("Please enter your secret key");
            }
        } else {
            const filledWords = wordInputs.filter(word => word.trim().length > 0);
            if (filledWords.length === 0) {
                errors.push("Please enter at least one word for your mnemonic phrase");
            }
        }

        // Check if image is selected
        if (uploadMethod === "upload") {
            if (!selectedFile) {
                errors.push("Please select an image to hide your message in");
            }
        } else {
            if (!selectedMovie) {
                errors.push("Please select a movie");
            }
            if (!selectedStyle) {
                errors.push("Please select a style");
            }
            if (!originalImagePreview) {
                errors.push("Please wait for the poster to load");
            }
        }

        return errors;
    };

    const handleEncode = async () => {
        const validationErrors = validateInputs();

        if (validationErrors.length > 0) {
            // Show all validation errors as toast notifications
            validationErrors.forEach((error, index) => {
                setTimeout(() => {
                    showToast(error, 'warning');
                }, index * 200); // Stagger the notifications
            });
            return;
        }

        const phrase = inputMode === "free" ? seedPhrase : wordInputs.join(" ");

        setIsEncoding(true);
        const formData = new FormData();

        if (uploadMethod === "upload") {
            formData.append("image", selectedFile!);
        } else {
            // For dropdown method, convert the preview image to a File object
            if (originalImagePreview) {
                try {
                    const response = await fetch(originalImagePreview);
                    const blob = await response.blob();
                    const imageFile = new File([blob], "poster.jpg", { type: blob.type });
                    formData.append("image", imageFile);
                } catch (error) {
                    showToast("Failed to load selected poster image", 'error');
                    setIsEncoding(false);
                    return;
                }
            } else {
                showToast("No image selected", 'error');
                setIsEncoding(false);
                return;
            }
        }

        formData.append("message", phrase);

        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        try {
            const response = await fetch(`${BACKEND_URL}/api/steganography/encode`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                setEncodedImage(`${BACKEND_URL}${result.url}`);
                showToast("Message encoded successfully!", 'success');
            } else {
                showToast("Encoding failed. Please try again.", 'error');
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("Error connecting to backend. Please check your connection.", 'error');
        } finally {
            setIsEncoding(false);
        }
    };

    const handleDownloadEncoded = async () => {
        if (encodedImage) {
            try {
                const response = await fetch(encodedImage);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'hidden-image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                showToast("Image downloaded successfully!", 'success');
            } catch (error) {
                console.error('Download failed:', error);
                showToast("Download failed. Please try again.", 'error');
            }
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

        // Master movie list - categorized by Cannes and Other movies
    const movieCategories = {
        cannes: [
            { title: "Parasite", filename: "parasite" },
            { title: "Taxi Driver", filename: "taxi-driver" },
            { title: "Amour", filename: "amour" },
            { title: "Pulp Fiction", filename: "pulp-fiction" },
            { title: "Apocalypse Now", filename: "apocalypse-now" },
            { title: "Mulholland Drive", filename: "mulholland-drive" },
            { title: "Amélie", filename: "amelie" },
            { title: "The Lobster", filename: "the-lobster" },
            { title: "The Square", filename: "the-square" },
        ],
        other: [
            { title: "Alien", filename: "alien" },
            { title: "Aliens", filename: "aliens" },
            { title: "Matrix", filename: "matrix" },
            { title: "The Pianist", filename: "the-pianist" },
            { title: "Titanic", filename: "titanic" },
        ]
    };

    // Flatten all movies for poster generation
    const masterMovieList = [...movieCategories.cannes, ...movieCategories.other];

    // Available styles with display names and folder paths
    const styleOptions = [
        { title: "Official Poster", folder: "original", extension: ".jpg" },
        { title: "Ghibli Style Poster", folder: "ghibli", extension: ".jpg" },
        { title: "Minimalistic Style Poster", folder: "minimal", extension: ".jpg" },
    ];

    // Get style object by folder name
    const getStyleByFolder = (folderName: string) => {
        return styleOptions.find(style => style.folder === folderName) || styleOptions[0];
    };

    // Get style object by title
    const getStyleByTitle = (title: string) => {
        return styleOptions.find(style => style.title === title) || styleOptions[0];
    };

    // Generate poster library based on selected style and category filter
    const currentStyle = getStyleByFolder(posterStyleFilter);
    const getMoviesToShow = () => {
        switch (movieFilter) {
            case "cannes":
                return movieCategories.cannes;
            case "other":
                return movieCategories.other;
            default:
                return masterMovieList;
        }
    };
    const filteredPosters = getMoviesToShow()
        .map(movie => ({
            movie: movie.title,
            style: currentStyle.title,
            path: `/posters/${currentStyle.folder}/${movie.filename}${currentStyle.extension}`
        }))
        .sort((a, b) => a.movie.localeCompare(b.movie));

    const handleLibrarySelection = (poster: typeof filteredPosters[0]) => {
        setSelectedMovie(poster.movie);
        setSelectedStyle(poster.style);
        setOriginalImagePreview(poster.path);
        setShowLibraryModal(false);
    };

    const handleLibraryModalClose = () => {
        setShowLibraryModal(false);
        // Reset filters to default when closing modal
        setPosterStyleFilter("ghibli");
        setMovieFilter("all");
    };

    const handleShufflePoster = () => {
        // Use current style or default to Ghibli
        const currentStyleToUse = selectedStyle || "Ghibli Style Poster";
        const styleForShuffle = getStyleByTitle(currentStyleToUse);

        // Pick random movie from master list
        const randomMovie = masterMovieList[Math.floor(Math.random() * masterMovieList.length)];

        // Create poster object
        const randomPoster = {
            movie: randomMovie.title,
            style: styleForShuffle.title,
            path: `/posters/${styleForShuffle.folder}/${randomMovie.filename}${styleForShuffle.extension}`
        };

        // Apply the selection
        setSelectedMovie(randomPoster.movie);
        setSelectedStyle(randomPoster.style);
        setOriginalImagePreview(randomPoster.path);

        showToast(`Random: ${randomPoster.movie} in ${randomPoster.style}`, 'info');
    };



    // Prevent body scroll when modals are open
    useEffect(() => {
        const isAnyModalOpen = showSettingsModal || showLibraryModal;

        if (isAnyModalOpen) {
            // Store current scroll position
            scrollPositionRef.current = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollPositionRef.current}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scroll position
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';

            // Restore scroll position using the stored value
            if (scrollPositionRef.current > 0) {
                window.scrollTo(0, scrollPositionRef.current);
            }
        }

        // Cleanup on unmount
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
        };
    }, [showSettingsModal, showLibraryModal]);
    return (
        <>
            <div className={styles.section}>
                <div className={styles.wrap}>
                    <div className={cn("h2", styles.title)}>Hide Your Data In Poster</div>
                    <div className={cn("h5M", styles.info)}>
                        Hide your secret data inside Cannes movie posters using advanced steganography
                    </div>

                    {/* Input Mode Selection with Generation Icons */}
                    <div className={styles.inputModeSelectContainer}>
                        <div className={styles.inputModeSelect}>
                            <label>
                                <input
                                    type="radio"
                                    name="posterInputMode"
                                    value="free"
                                    checked={inputMode === "free"}
                                    onChange={(e) => {
                                        setInputMode(e.target.value as "free" | "words");
                                        setMnemonicHidden(false); // Reset to visible when switching modes
                                    }}
                                />
                                Free Input
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="posterInputMode"
                                    value="words"
                                    checked={inputMode === "words"}
                                    onChange={(e) => {
                                        setInputMode(e.target.value as "free" | "words");
                                        setMnemonicHidden(false); // Reset to visible when switching to mnemonic mode
                                    }}
                                />
                                Mnemonic Phrase
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
                            ) : (
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
                            )}
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
                    ) : (
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
                    )}

                    {/* Upload Method */}
                    <div className={styles.uploadMethodSelectContainer}>
                        <div className={styles.uploadMethodSelect}>
                            <label>
                                <input
                                    type="radio"
                                    name="uploadMethod"
                                    value="upload"
                                    checked={uploadMethod === "upload"}
                                    onChange={(e) => setUploadMethod(e.target.value as "upload" | "dropdown")}
                                />
                                Upload Image
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="uploadMethod"
                                    value="dropdown"
                                    checked={uploadMethod === "dropdown"}
                                    onChange={(e) => setUploadMethod(e.target.value as "upload" | "dropdown")}
                                />
                                Generate with AI
                            </label>
                        </div>

                        <div className={styles.libraryIconContainer}>
                            {uploadMethod === "dropdown" && (
                                <>
                                    <button
                                        className={styles.iconButton}
                                        onClick={handleShufflePoster}
                                        title="Shuffle random poster"
                                    >
                                        🔀
                                    </button>
                                    <button
                                        className={styles.iconButton}
                                        onClick={() => setShowLibraryModal(true)}
                                        title="Browse poster library"
                                    >
                                        📚
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {uploadMethod === "upload" ? (
                        <div className={styles.uploadArea} onClick={() => document.getElementById('hide-file')?.click()}>
                            {selectedFile ? (
                                <span>Selected: {selectedFile.name}</span>
                            ) : (
                                <span>Click to upload image</span>
                            )}
                            <input
                                id="hide-file"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    ) : (
                        <div className={styles.dropdownSection}>
                            <select
                                value={selectedStyle}
                                onChange={(e) => {
                                    setSelectedStyle(e.target.value);
                                    handleMovieStyleChange(selectedMovie, e.target.value);
                                }}
                                className={styles.dropdown}
                            >
                                <option value="">Select Style</option>
                                {styleOptions.map(style => (
                                    <option key={style.folder} value={style.title}>{style.title}</option>
                                ))}
                            </select>
                            <select
                                value={selectedMovie}
                                onChange={(e) => {
                                    setSelectedMovie(e.target.value);
                                    handleMovieStyleChange(e.target.value, selectedStyle);
                                }}
                                className={styles.dropdown}
                            >
                                <option value="">Select Movie</option>
                                <optgroup label="Cannes Movies">
                                    {movieCategories.cannes
                                        .sort((a, b) => a.title.localeCompare(b.title))
                                        .map((movie, index) => (
                                            <option key={movie.filename} value={movie.title}>
                                                {movie.title}
                                            </option>
                                        ))}
                                </optgroup>
                                <optgroup label="Other Movies">
                                    {movieCategories.other
                                        .sort((a, b) => a.title.localeCompare(b.title))
                                        .map((movie, index) => (
                                            <option key={movie.filename} value={movie.title}>
                                                {movie.title}
                                            </option>
                                        ))}
                                </optgroup>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.cardsSection}>
                <div className={styles.imageCard}>
                    <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                            <h4 className={styles.cardTitle}>Original Image</h4>
                            <div className={styles.headerActions}>
                                <button
                                    className={styles.iconButton}
                                    onClick={() => setShowSettingsModal(true)}
                                    title="Encryption settings"
                                >
                                    ⚙️
                                </button>
                                <button
                                    className={cn("button", styles.headerButton, {
                                        [styles.disabled]: isEncoding
                                    })}
                                    onClick={handleEncode}
                                    disabled={isEncoding}
                                >
                                    {isEncoding ? "Hiding Message..." : "Process Image"}
                                </button>
                            </div>
                        </div>
                        <div className={styles.imagePreviewArea}>
                            {originalImagePreview ? (
                                <img src={originalImagePreview} alt="Original" className={styles.cardImage} />
                            ) : (
                                <div className={styles.placeholderContent}>
                                    <span>Original image will appear here</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.imageCard}>
                    <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                            <h4 className={styles.cardTitle}>Processed Image</h4>
                            <button
                                className={cn("button", styles.headerButton, {
                                    [styles.disabled]: !encodedImage
                                })}
                                onClick={handleDownloadEncoded}
                                disabled={!encodedImage}
                            >
                                Download Image
                            </button>
                        </div>
                        <div className={styles.imagePreviewArea}>
                            {encodedImage ? (
                                <img src={encodedImage} alt="Hidden" className={styles.cardImage} />
                            ) : (
                                <div className={styles.placeholderContent}>
                                    <span>Secret image will appear here</span>
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

            {/* Library Modal */}
            {showLibraryModal && (
                <div className={styles.modalOverlay} onClick={handleLibraryModalClose}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Choose from Poster Library</h3>
                            <div className={styles.modalHeaderActions}>
                                <select
                                    value={movieFilter}
                                    onChange={(e) => setMovieFilter(e.target.value)}
                                    className={styles.styleFilterDropdown}
                                >
                                    <option value="all">All Movies</option>
                                    <option value="cannes">Only Cannes</option>
                                    <option value="other">Other Movies</option>
                                </select>
                                <select
                                    value={posterStyleFilter}
                                    onChange={(e) => setPosterStyleFilter(e.target.value)}
                                    className={styles.styleFilterDropdown}
                                >
                                    {styleOptions.map(style => (
                                        <option key={style.folder} value={style.folder}>{style.title}</option>
                                    ))}
                                </select>
                                <button
                                    className={styles.modalClose}
                                    onClick={handleLibraryModalClose}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className={styles.posterGrid}>
                            {filteredPosters.map((poster, index) => (
                                <div
                                    key={index}
                                    className={styles.posterItem}
                                    onClick={() => handleLibrarySelection(poster)}
                                >
                                    <img
                                        src={poster.path}
                                        alt={`${poster.movie} - ${poster.style}`}
                                        className={styles.posterImage}
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            img.style.display = 'none';
                                            img.parentElement?.classList.add(styles.imageFallback);
                                        }}
                                    />
                                    <div className={styles.posterInfo}>
                                        <div className={styles.posterMovie}>{poster.movie}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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

export default EncodeKeyInPoster;