import { useMediaQuery } from "react-responsive";
import cn from "classnames";
import styles from "./Generation.module.sass";
import Image from "@/components/Image";

import { generation } from "@/mocks/generation";

type GenerationProps = {
    scrollToRef?: any;
};

const Generation = ({ scrollToRef }: GenerationProps) => {
    const isMobile = useMediaQuery({
        query: "(max-width: 767px)",
    });

    return (
        <div className={cn("section-border", styles.generation)}>
            <div className={styles.anchor} ref={scrollToRef}></div>
            <div className={cn("container", styles.container)}>
                <h2 className={cn("h2", styles.title)}>
                Project Key Focus
                </h2>
                <div className={styles.list}>
                    {generation.map((item, index) => (
                        <div
                            className={styles.item}
                            key={index}
                        >
                            <div
                                className={styles.preview}
                                style={{ backgroundColor: item.color }}
                            >
                                {/*item.label && (
                                    <div
                                        className={cn(
                                            {
                                                ["label"]: item.label === "new",
                                            },
                                            styles.label
                                        )}
                                    >
                                        {item.label}
                                    </div>
                                )*/}
                                <div className={styles.image}>
                                    <Image
                                        src={item.image}
                                        width={164}
                                        height={164}
                                        alt="Generation"
                                        priority
                                    />
                                </div>
                            </div>
                            <div className={cn("h5", styles.subtitle)}>
                                {item.title}
                            </div>
                            <div className={styles.content}>{item.content}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Generation;
