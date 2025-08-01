import { useState } from "react";
import cn from "classnames";
import styles from "./PortfolioCards.module.sass";
import PortfolioModal from "@/components/PortfolioModal";
import Icon from "@/components/Icon";

type Protocol = {
    id: string;
    name: string;
    network: string;
    icon: string;
    supplied: number;
    interestEarned: number;
    color: string;
};

// Mock data based on your screenshots
const protocols: Protocol[] = [
    {
        id: "spark",
        name: "Spark Protocol",
        network: "Ethereum Network",
        icon: "star", // Using star icon as placeholder
        supplied: 50000,
        interestEarned: 428,
        color: "#ff6b9d" // Pink gradient color from screenshot
    },
    {
        id: "uniswap",
        name: "Uniswap Protocol", 
        network: "Ethereum Network",
        icon: "swap", // Using swap icon as placeholder
        supplied: 4439,
        interestEarned: 1,
        color: "#4ade80" // Green color from screenshot
    }
];

const PortfolioCards = () => {
    const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleProtocolClick = (protocol: Protocol) => {
        setSelectedProtocol(protocol);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedProtocol(null);
    };

    // Calculate total portfolio value
    const totalPortfolioValue = protocols.reduce(
        (total, protocol) => total + protocol.supplied + protocol.interestEarned, 
        0
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Portfolio Overview</h2>
                <div className={styles.totalValue}>
                    Total: {formatCurrency(totalPortfolioValue)}
                </div>
            </div>

            <div className={styles.cards}>
                {protocols.map((protocol) => {
                    // Calculate Current Portfolio Value as Supplied + Interest Earned
                    const currentPortfolioValue = protocol.supplied + protocol.interestEarned;
                    
                    return (
                        <div 
                            key={protocol.id}
                            className={styles.card}
                            onClick={() => handleProtocolClick(protocol)}
                        >
                            <div className={styles.cardHeader}>
                                <div 
                                    className={styles.cardIcon}
                                    style={{ backgroundColor: protocol.color }}
                                >
                                    <Icon name={protocol.icon} size={20} />
                                </div>
                                <div className={styles.cardActions}>
                                    <button className={styles.detailsButton}>
                                        Details
                                        <Icon name="external-link" size={12} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.cardContent}>
                                <h3 className={styles.protocolName}>{protocol.name}</h3>
                                <div className={styles.portfolioValue}>
                                    {formatCurrency(currentPortfolioValue)}
                                </div>
                                
                                <div className={styles.metrics}>
                                    <div className={styles.metric}>
                                        <span className={styles.metricLabel}>Supplied:</span>
                                        <span className={styles.metricValue}>
                                            {formatCurrency(protocol.supplied)}
                                        </span>
                                    </div>
                                    <div className={styles.metric}>
                                        <span className={styles.metricLabel}>Interest:</span>
                                        <span className={styles.metricValue}>
                                            {formatCurrency(protocol.interestEarned)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <PortfolioModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                protocol={selectedProtocol}
            />
        </div>
    );
};

export default PortfolioCards;