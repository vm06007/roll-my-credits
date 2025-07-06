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
    const [metaMaskModalIndex, setMetaMaskModalIndex] = useState(0);

    const handleWatchDemo = () => {
        setIsVideoModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsVideoModalVisible(false);
    };

    const handleTheaterMasksClick = () => {
        setMetaMaskModalIndex(0);
        setIsMetaMaskModalVisible(true);
    };

    const handleMetaMaskItemClick = () => {
        setMetaMaskModalIndex(1); // Focus on slide #2 (index 1)
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
                                        onClick={handleMetaMaskItemClick}
                                        style={{ cursor: 'pointer' }}
                                        title="Click to see MetaMask modal (slide 2)"
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
                        <video
                            width="800"
                            height="450"
                            controls
                            autoPlay
                            style={{ borderRadius: '12px', background: '#000' }}
                        >
                            <source src="/video/medium.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </Modal>
            <MetaMaskModal
                visible={isMetaMaskModalVisible}
                onClose={handleCloseMetaMaskModal}
                startingIndex={metaMaskModalIndex}
            />
        </div>
    );
};

export default Main;
