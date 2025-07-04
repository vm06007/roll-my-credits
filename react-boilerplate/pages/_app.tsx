import type { AppProps } from "next/app";
import { ParallaxProvider } from "react-scroll-parallax";
import { ThemeProvider } from "../contexts/ThemeContext";
import "../styles/app.sass";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider>
            <ParallaxProvider>
                <Component {...pageProps} />
            </ParallaxProvider>
        </ThemeProvider>
    );
}

export default MyApp;
