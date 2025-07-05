import { useRef } from "react";
import Layout from "@/components/Layout";
import Main from "./Main";
import DemoA from "../DemoA";

const DemoPage = () => {
    const scrollToRef = useRef(null);

    return (
        <Layout layoutNoOverflow>
            {/* <Main scrollToRef={scrollToRef} /> */}
            <DemoA scrollToRef={scrollToRef} />
        </Layout>
    );
};

export default DemoPage;