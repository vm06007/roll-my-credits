import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import styles from "./MetaMaskModal.module.sass";

type MetaMaskModalProps = {
    visible: boolean;
    onClose: () => void;
    slides?: any;
    startingIndex?: number;
};

// Array of MetaMask interface images for the gallery
const defaultImages = [
    {
        src: "/images/spy-leak.jpg",
        alt: "Show secret image",
        title: "Avoid private key exposure",
        width: "800px"
    },
    {
        src: "/images/visual-exposure.jpg",
        alt: "Show secret image",
        title: "Avoid private key exposure",
        width: "800px"
    },
    {
        src: "/images/reveal-secret-image.png",
        alt: "MetaMask Import Interface",
        title: "Reveal Options",
        width: "400px"
    },
    {
        src: "/images/import-secret-image0.jpg",
        alt: "Import secret image",
        title: "Import secret image",
        width: "400px"
    },
    {
        src: "/images/import-secret-image1.jpg",
        alt: "Import secret image",
        title: "Import secret image",
        width: "400px"
    },
    {
        src: "/images/show-secret-image.jpg",
        alt: "Show secret image",
        title: "Avoid private key exposure",
        width: "400px"
    },
];

const MetaMaskModal = ({ visible, onClose, startingIndex = 0, slides = defaultImages}: MetaMaskModalProps) => {

    if (startingIndex > slides.length - 1) {
        startingIndex = slides.length - 1
    }

    const [currentImageIndex, setCurrentImageIndex] = useState(startingIndex);


    // Set initial image when modal opens
    useEffect(() => {
        if (visible) {

            if (startingIndex > slides.length - 1) {
                startingIndex = slides.length - 1
            }

            const initialIndex = Math.max(0, Math.min(startingIndex, slides.length - 1));
            setCurrentImageIndex(initialIndex);
        }
    }, [visible, startingIndex]);

    const handlePreviousImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? slides.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === slides.length - 1 ? 0 : prev + 1
        );
    };

    // Keyboard navigation for gallery
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!visible) return;

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                handlePreviousImage();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                handleNextImage();
            }
        };

        // Add event listener when modal is visible
        if (visible) {
            document.addEventListener('keydown', handleKeyPress);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [visible]);

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            video={false}
            containerClassName={styles.metamaskModalContainer}
        >
            <div className={styles.metamaskModalContent}>
                <img
                    src={slides[currentImageIndex].src}
                    alt={slides[currentImageIndex].alt}
                    className={styles.metamaskInterfaceImage}
                    style={{ width: slides[currentImageIndex].width }}
                />

                {/* Gallery Navigation */}
                <div className={styles.galleryNavigation}>
                    <button
                        className={styles.navArrow}
                        onClick={handlePreviousImage}
                        title="Previous image"
                    >
                        ‹
                    </button>

                    <div className={styles.imageInfo}>
                        <span className={styles.imageTitle}>
                            {slides[currentImageIndex].title}
                        </span>
                        <span className={styles.imageCounter}>
                            {currentImageIndex + 1} / {slides.length}
                        </span>
                    </div>

                    <button
                        className={styles.navArrow}
                        onClick={handleNextImage}
                        title="Next image"
                    >
                        ›
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default MetaMaskModal;