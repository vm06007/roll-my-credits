import { useState } from "react";
import Link from "next/link";
import cn from "classnames";
import styles from "./Global.module.sass";
import Image from "@/components/Image";
import MetaMaskModal from "@/components/MetaMaskModal";

import { images } from "@/constants/global";

type GlobalProps = {
    startingImage?: number;
};

const antropicImages = [
    {
        src: "/images/good-example.jpg",
        alt: "Show secret image",
        title: "Avoid private key exposure",
        width: "999px"
    },
    {
        src: "/images/good-example.jpg",
        alt: "Show secret image",
        title: "Avoid private key exposure",
        width: "999px"
    },
    {
        src: "/images/good-example.jpg",
        alt: "Show secret image",
        title: "Avoid private key exposure",
        width: "999px"
    },
    {
        src: "/images/good-example.jpg",
        alt: "Show secret image",
        title: "Avoid private key exposure",
        width: "999px"
    },
];

const metaMaskImages = [
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

const Global = ({ startingImage = 0 }: GlobalProps) => {

    const [currentSlides, setCurrentSlides] = useState(metaMaskImages)

    const [isMetaMaskModalVisible, setIsMetaMaskModalVisible] = useState(false);
    const [modalStartingIndex, setModalStartingIndex] = useState(startingImage || 0);

    const handleMetaMaskClick = () => {
        setModalStartingIndex(3);
        setCurrentSlides(metaMaskImages);
        setIsMetaMaskModalVisible(true);
    };

    const handleAgentClick = () => {
        setModalStartingIndex(0);
        setCurrentSlides(antropicImages);
        setIsMetaMaskModalVisible(true);
    };

    const handleTheaterMasksClick = () => {
        setModalStartingIndex(3);
        setCurrentSlides(metaMaskImages);
        setIsMetaMaskModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsMetaMaskModalVisible(false);
    };

    return (
        <>
            <div className={styles.join}>
                <div className={cn("container", styles.container)}>
                    <div className={styles.wrap}>
                        <img
                            className={styles.hackathonLogo}
                            src="https://ethglobal.storage/events/cannes/logo/default" alt="Hackathon"
                        />
                        {/*<div className={styles.avatars}>
                            {avatars.map((avatar, index) => (
                                <div className={styles.avatar} key={index}>
                                    <Image
                                        src={avatar}
                                        layout="fill"
                                        alt="Avatar"
                                        priority
                                    />
                                </div>
                            ))}
                        </div>*/}
                        <br />
                        {/*<div className={styles.btns}>
                            <a
                                className={cn(
                                    "button",
                                    styles.button,
                                    styles.invert,
                                    styles.bigger
                                )}
                                href="/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Try It Out
                            </a>
                            <Link href="/about-us">
                                <a className={cn(
                                    "button-gray",
                                    styles.button,
                                    styles.bigger
                                )}>
                                    Watch Demo
                                </a>
                            </Link>
                        </div>*/}
                    </div>
                    <div className={styles.images}>
                        {images.map((image, index) => (
                            <div
                                className={styles.image}
                                key={index}
                            >
                                {index === 5 ? (
                                    <div
                                        className={styles.metamaskImage}
                                        onClick={handleMetaMaskClick}
                                        title="Click to see MetaMask integration"
                                    >
                                        <Image
                                            src={image.src}
                                            width={image.width}
                                            height={image.height}
                                            alt={image.alt}
                                        />
                                    </div>
                                ) : index === 2 ? (
                                    <div
                                        className={styles.metamaskImage}
                                        onClick={handleAgentClick}
                                        title="Click to see Claude Code integration"
                                    >
                                        <Image
                                            src={image.src}
                                            width={image.width}
                                            height={image.height}
                                            alt={image.alt}
                                        />
                                    </div>
                                ) : index === 8 ? (
                                    <div
                                        className={styles.metamaskImage}
                                        onClick={handleTheaterMasksClick}
                                        title="Click to see theater masks steganography"
                                    >
                                        <Image
                                            src={image.src}
                                            width={image.width}
                                            height={image.height}
                                            alt={image.alt}
                                        />
                                    </div>
                                ) : (
                                    <Image
                                        src={image.src}
                                        width={image.width}
                                        height={image.height}
                                        alt={image.alt}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MetaMask Modal */}
            <MetaMaskModal
                visible={isMetaMaskModalVisible}
                onClose={handleCloseModal}
                slides={currentSlides || metaMaskImages}
                startingIndex={modalStartingIndex}
            />
        </>
    );
};

export default Global;
