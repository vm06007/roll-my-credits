import Layout from "@/components/Layout";
import PortfolioCards from "@/components/PortfolioCards";
import styles from "../styles/Portfolio.module.sass";

const PortfolioPage = () => {
    return (
        <Layout>
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>DeFi Portfolio</h1>
                        <p className={styles.subtitle}>
                            Track your protocol positions and earnings
                        </p>
                    </div>
                    <PortfolioCards />
                </div>
            </div>
        </Layout>
    );
};

export default PortfolioPage;