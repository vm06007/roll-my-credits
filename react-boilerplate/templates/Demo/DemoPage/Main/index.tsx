import cn from "classnames";
import styles from "./Main.module.sass";
import Image from "@/components/Image";
import Scroll from "@/components/Scroll";

type MainProps = {
    scrollToRef: any;
};

const Main = ({ scrollToRef }: MainProps) => (
    <div className={cn("section", styles.main)}>
        <div className={cn("container", styles.container)}>
            <div className={styles.wrap}>
                <h1 className={cn("hero", styles.title)}>It Is Demo Time</h1>
                <div className={cn("h5M", styles.info)}>Explore Deep Neural Network Steganography</div>
            </div>
            <div className={styles.preview}>
                <Image
                    src="/images/help.png"
                    width={950}
                    height={712}
                    alt="Demo"
                />
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
    </div>
);

export default Main;