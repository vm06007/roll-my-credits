import { useState } from "react";
import cn from "classnames";
import styles from "./DemoA.module.sass";
import Tabs from "@/components/Tabs";
import Select from "@/components/Select";

import { demoTabs } from "@/constants/demoTabs";
import {
    EncodeKeyInPoster,
    DecodeKeyFromPoster,
    EncodeKeyInCredits,
    DecodeKeyFromCredits
} from "./components";

type DemoAProps = {
    scrollToRef: any;
};

const DemoA = ({ scrollToRef }: DemoAProps) => {

    const [activeTab, setActiveTab] = useState<string>("encode_poster");

    // Static data that components might need
    const movies = [
        "Pulp Fiction",
        "Taxi Driver",
        "Apocalypse Now",
        "Amour"
    ];

    const styles_options = ["Original Style", "Ghibli Style", "Minimalistic Style"];
    const wordTypes = ["original", "movies", "french", "chinese"];

    const handleTabChange = (value: string) => setActiveTab(value);

    return (
        <div className={styles.main}>
            <div className={styles.anchor} ref={scrollToRef}></div>
            <div className={cn("container", styles.container)}>
                <div className={styles.head}>
                    <Tabs
                        className={styles.tabs}
                        items={demoTabs}
                        value={activeTab}
                        setValue={setActiveTab}
                    />
                    <Select
                        className={styles.select}
                        value={activeTab}
                        onChange={handleTabChange}
                        options={demoTabs}
                        small
                    />
                </div>
                <div className={styles.content}>
                    {activeTab === "encode_poster" && (
                        <EncodeKeyInPoster
                            movies={movies}
                            styles_options={styles_options}
                            wordTypes={wordTypes}
                        />
                    )}

                    {activeTab === "decode_poster" && (
                        <DecodeKeyFromPoster />
                    )}

                    {activeTab === "encode_credit" && (
                        <EncodeKeyInCredits
                            wordTypes={wordTypes}
                        />
                    )}

                    {activeTab === "decode_credit" && (
                        <DecodeKeyFromCredits />
                    )}
                </div>
            </div>
            <div className={styles.circles}>
                {Array.from(Array(4).keys()).map((x) => (
                    <span
                        key={x}
                        className={styles.circle}
                    ></span>
                ))}
            </div>
        </div>
    );
};

export default DemoA;