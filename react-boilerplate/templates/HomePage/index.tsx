import { useRef } from "react";
import Layout from "@/components/Layout";
import Main from "./Main";
import Website from "./Website";
import Generation from "./Generation";
import Design from "./Design";
import Global from "@/components/Global";
import Plugins from "@/templates/HomePage/Plugins";
import Team from "@/templates/HomePage/Team";

const HomePage = () => {

    const scrollToRef = useRef(null);

    return (
        <Layout layoutNoOverflow>
            <Main scrollToRef={scrollToRef} />
            <Generation scrollToRef={scrollToRef} />
            <Website />
            <Plugins />
            <Design />
            <Team />
            <Global />
        </Layout>
    );
};

export default HomePage;
