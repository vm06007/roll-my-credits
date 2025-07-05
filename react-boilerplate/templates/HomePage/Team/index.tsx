import { useState } from "react";
import Link from "next/link";
import cn from "classnames";
import styles from "./Team.module.sass";
import Image from "@/components/Image";
import Modal from "@/components/Modal";

import { team } from "@/constants/team";

type TeamProps = {};

const Team = ({}: TeamProps) => {
    const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);

    const handleWatchDemo = () => {
        setIsVideoModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsVideoModalVisible(false);
    };

    return (
        <>
            <div className={cn("section", styles.team)}>
                <div className={cn("container", styles.container)}>
                    <div className={styles.details}>
                        <div className={cn("h3", styles.title)}>
                            Meet The Team
                        </div>
                        <div className={styles.content}>
                            We hack for ETHGlobal Hackathon in Cannes.
                            <br />
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
                    <div className={styles.list}>
                        {team.map((item, index) => (
                            <div className={styles.item} key={index}>
                                <a
                                    href={item.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.photo}
                                    style={{ display: 'block' }}
                                >
                                    <Image
                                        src={item.photo}
                                        layout="fill"
                                        objectFit="cover"
                                        alt="Photo"
                                    />
                                </a>
                                <div className={cn("h5M", styles.name)}>
                                    {item.name}
                                </div>
                                <div className={styles.position}>{item.position}</div>
                            </div>
                        ))}
                    </div>
                </div>
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
        </>
    );
};

export default Team;
