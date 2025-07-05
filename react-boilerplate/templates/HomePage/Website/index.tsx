import { useState } from "react";
import cn from "classnames";
import styles from "./Website.module.sass";
import Image from "@/components/Image";
import Modal from "@/components/Modal";

const Website = () => {
    const [showResourcesModal, setShowResourcesModal] = useState(false);

    const steganographyResources = [
        {
            title: "What is Steganography? - GeeksforGeeks",
            description: "Comprehensive introduction to steganography concepts",
            links: [
                { label: "Read It Now", url: "https://www.geeksforgeeks.org/computer-networks/what-is-steganography/" }
            ],
            type: "Important Facts"
        },
        {
            title: "Privacy-Preserving Natural Language Steganography ",
            description: "Using large language models and advanced neural architectures",
            links: [
                { label: "MDPI Paper", url: "https://www.mdpi.com/2073-431X/14/5/165" },
                { label: "Preprint", url: "https://www.preprints.org/manuscript/202503.0627/v1" }
            ],
            type: "Research 2025"
        },
        {
            title: "Video Steganography: Recent Advances and Challenges",
            description: "Technical overview of digital image steganography methods",
            links: [
                { label: "Read It Now", url: "https://link.springer.com/article/10.1007/s11042-023-14844-w" }
            ],
            type: "Academic Paper"
        },
        {
            title: "Deep Steganography Using Autoencoders",
            description: "Collection of steganography tools by (Kumar M) and (Kartik A)",
            links: [
                { label: "Check Out", url: "https://github.com/ShanjayKumarM/Deep-Steganography-using-Autoencoders" }
            ],
            type: "Repository Code"
        },
        {
            title: "Image Steganography Using Deep Learning",
            description: "Illustrational implementation of steganography using deep learning",
            links: [
                { label: "Check Out", url: "https://github.com/Akhilesh53/Image-Steganography-Using-Deep-Learning" }
            ],
            type: "Repository Code"
        },
        /*{
            title: "OpenStego - Open Source Steganography Tool",
            description: "Free steganography software for hiding data in images",
            links: [
                { label: "Website", url: "https://www.openstego.com/" },
                { label: "GitHub", url: "https://github.com/syvaidya/openstego" }
            ],
            type: "Tool"
        },*/
        /*{
            title: "Steganography Toolkit - GitHub",
            description: "Collection of steganography tools and implementations",
            links: [
                { label: "Repository", url: "https://github.com/DominicBreuker/stego-toolkit" }
            ],
            type: "Repository"
        },
        {
            title: "LSB Steganography Explained",
            description: "Deep dive into Least Significant Bit steganography technique",
            links: [
                { label: "Research Paper", url: "https://www.ijcaonline.org/archives/volume125/number9/22270-2015905925" }
            ],
            type: "Technical Guide"
        }*/
    ];

    return (
        <div className={cn("section-border", styles.website)}>
            <div className={cn("container", styles.container)}>
                <div className={styles.wrap}>
                    <h2 className={cn("h2", styles.title)}>
                        Hide Secrets In Cannes Movie Posters
                    </h2>
                    <div className={cn("h5M", styles.info)}>
                        Privacy-Preserving Neural Architecture <button
                            onClick={() => setShowResourcesModal(true)}
                            className={styles.inlineLink}
                        >
                            Steganography
                        </button>
                    </div>
                    <button
                        className={cn(
                            "button",
                            styles.button,
                            styles.invert,
                            styles.bigger
                        )}
                        onClick={() => setShowResourcesModal(true)}
                    >
                        🔎 &nbsp; About Deep Steganography
                    </button>
                </div>
                <div className={styles.previewMobile}>
                    <Image
                        src="/images/website-pic-mobile.png"
                        width={400}
                        height={1101}
                        alt="Hero"
                    />
                </div>
                <div className={styles.previewDesktop}>
                    <Image
                        src="/images/website-pic-desktop.png"
                        width={864}
                        height={500}
                        alt="Hero"
                    />
                </div>
                <div className={styles.preview}>
                    <Image
                        src="/images/website-pic.png"
                        width={720}
                        height={500}
                        alt="Hero"
                    />
                </div>
            </div>

            {/* Steganography Resources Modal */}
            <Modal
                visible={showResourcesModal}
                onClose={() => setShowResourcesModal(false)}
                containerClassName={styles.resourcesModalContainer}
            >
                <div className={styles.resourcesModalContent}>
                    <div className={styles.resourcesHeader}>
                        <h2 className={styles.resourcesTitle}>Steganography Resources</h2>
                        <p className={styles.resourcesSubtitle}>
                            These are articles and resources that helped us with this projects
                        </p>
                    </div>

                    <div className={styles.resourcesList}>
                        {steganographyResources.map((resource, index) => (
                            <div key={index} className={styles.resourceItem}>
                                <div className={styles.resourceInfo}>
                                    <div className={styles.resourceType}>{resource.type}</div>
                                    <h3 className={styles.resourceTitle}>{resource.title}</h3>
                                    <p className={styles.resourceDescription}>{resource.description}</p>
                                </div>
                                <div className={styles.resourceButtons}>
                                    {resource.links.map((link, linkIndex) => (
                                        <button
                                            key={linkIndex}
                                            className={cn("button", styles.resourceButton)}
                                            onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                                        >
                                            {link.label} →
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Website;
