import cn from "classnames";
import styles from "./Plugins.module.sass";
import Image from "@/components/Image";

import { plugins } from "@/constants/plugins";

type PluginsProps = {};

const Plugins = ({}: PluginsProps) => (
    <div className={cn("section", styles.plugins)}>
        <div className={cn("container-medium", styles.container)}>
            <div className={styles.head}>
                <div className={cn("h2", styles.title)}>Stack & Plugins</div>
                <div className={cn("h5M", styles.info)}>
                    Technologies used for hackathon project
                </div>
            </div>
            <div className={styles.list}>
                {plugins.map((item: any, index: number) => (
                    <div className={styles.item} key={index}>
                        <div className={styles.preview}>
                            <Image
                                src={item.image}
                                layout="fill"
                                objectFit="cover"
                                alt="Folder"
                            />
                        </div>
                        <div className={styles.details}>
                            <div className={cn("h4", styles.subtitle)}>
                                {item.title}
                            </div>
                            <div className={styles.content}>{item.info}</div>
                        </div>
                        <div className={styles.price}>
                            <button
                                className={cn(
                                    "button",
                                    styles.button,
                                    styles.invert,
                                    styles.bigger
                                )}
                                onClick={() => {
                                    if (item.repo) {
                                        window.open(item.repo, "_blank");
                                    } else {
                                        console.log(`Open repository for ${item.title}`);
                                    }
                                }}
                            >
                                {item.buttonLabel ? item.buttonLabel : "Open Repository"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default Plugins;
