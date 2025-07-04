import { useRef } from "react";
import Layout from "@/components/Layout";
import DemoA from "../DemoA";

const DemoPage = () => {
    const scrollToRef = useRef(null);

    return (
        <Layout layoutNoOverflow>
            <DemoA scrollToRef={scrollToRef} />
        </Layout>
    );
};

export default DemoPage;