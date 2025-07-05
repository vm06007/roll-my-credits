import cn from "classnames";
import styles from "./Design.module.sass";
import Image from "@/components/Image";

type DesignProps = {};

const Design = ({}: DesignProps) => (
    <div className={styles.design}>
        <div className={cn("container", styles.container)}>
            <div className={cn("h2", styles.title)}>
                Supports Video Steganography using AI
            </div>
            <div className={cn("h5M", styles.info)}>
            </div>
            <div className={styles.preview}>
                <Image
                    src="/images/design.jpg"
                    width={1184}
                    height={737}
                    alt="Design"
                />
                <div className={styles.circles}>
                    {Array.from(Array(3).keys()).map((x) => (
                        <img
                            key={x}
                            className={styles.circle}
                            src={`/images/item0-${x}.png`}
                            alt="Hero"
                        />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default Design;
