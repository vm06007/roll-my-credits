import { useState } from "react";
import Link from "next/link";
import cn from "classnames";
import styles from "./Main.module.sass";
import Image from "@/components/Image";
import Scroll from "@/components/Scroll";
import Modal from "@/components/Modal";
import MetaMaskModal from "@/components/MetaMaskModal";

type MainProps = {
    scrollToRef: any;
};

const Main = ({ scrollToRef }: MainProps) => {
    const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
    const [isMetaMaskModalVisible, setIsMetaMaskModalVisible] = useState(false);

    const handleWatchDemo = () => {
        setIsVideoModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsVideoModalVisible(false);
    };

    const handleTheaterMasksClick = () => {
        setIsMetaMaskModalVisible(true);
    };

    const handleCloseMetaMaskModal = () => {
        setIsMetaMaskModalVisible(false);
    };

    return (
        <div className={cn("section", styles.main)}>
            <div className={cn("container", styles.container)}>
                <div className={styles.wrap}>
                    <h1 className={cn("hero", styles.title)}>Roll The Credits</h1>
                    <div className={cn("h4M", styles.info)}>
                        Secret Data & Mnemonic Phrase Creative Manager
                    </div>
                    <div className={styles.btns}>
                        <Link href="/demo">
                            <a
                                className={cn(
                                    "button",
                                    styles.button,
                                    styles.invert,
                                    styles.bigger
                                )}
                            >
                                Try Demo
                            </a>
                        </Link>
                        <button
                            className={cn(
                                "button-gray",
                                styles.button,
                                styles.bigger
                            )}
                            onClick={handleWatchDemo}
                        >
                            Watch Demo
                        </button>
                    </div>
                </div>
                <div className={styles.preview}>
                    <Image
                        className={styles.image}
                        src="/images/main-pic-1.png"
                        width={980}
                        height={735}
                        alt="Hero"
                    />
                    <div className={styles.ball}></div>
                    <div className={styles.circles}>
                        {Array.from(Array(4).keys()).map((x) => (
                            <div
                                key={x}
                                className={styles.circle}
                            >
                                {x === 1 ? (
                                    <img
                                        src={`/images/item-${x}.png`}
                                        alt="Theater Masks"
                                        onClick={handleTheaterMasksClick}
                                        style={{ cursor: 'pointer' }}
                                        title="Click to see theater masks steganography"
                                    />
                                ) : (
                                    <img src={`/images/item-${x}.png`} alt="Hero" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <Scroll
                    title="Scroll down"
                    onScroll={() =>
                        scrollToRef.current?.scrollIntoView({
                            behavior: "smooth",
                        })
                    }
                />
            </div>
            <Modal
                visible={isVideoModalVisible}
                onClose={handleCloseModal}
                video={true}
            >
                <div className={styles.videoWrapper}>
                    <div className={styles.videoContainer}>
                        <iframe
                            width="800"
                            height="450"
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=your_params"
                            title="Roll The Credits Demo"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Main;
