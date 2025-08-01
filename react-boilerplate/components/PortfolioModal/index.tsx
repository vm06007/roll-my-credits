import { useState } from "react";
import cn from "classnames";
import styles from "./PortfolioModal.module.sass";
import Modal from "@/components/Modal";
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

type PortfolioModalProps = {
    visible: boolean;
    onClose: () => void;
    protocol?: Protocol;
};

const PortfolioModal = ({ visible, onClose, protocol }: PortfolioModalProps) => {
    if (!protocol) return null;

    // Calculate Current Portfolio Value as Supplied + Interest Earned
    const currentPortfolioValue = protocol.supplied + protocol.interestEarned;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            className={styles.modal}
            containerClassName={styles.container}
        >
            <div className={styles.header}>
                <div className={styles.protocolInfo}>
                    <div 
                        className={styles.icon}
                        style={{ backgroundColor: protocol.color }}
                    >
                        <Icon name={protocol.icon} size={24} />
                    </div>
                    <div className={styles.details}>
                        <h2 className={styles.protocolName}>{protocol.name}</h2>
                        <p className={styles.network}>{protocol.network}</p>
                    </div>
                </div>
                <div className={styles.actions}>
                    <button className={styles.actionButton}>
                        <Icon name="external-link" size={16} />
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.portfolioSection}>
                    <h3 className={styles.sectionTitle}>Current Portfolio Value</h3>
                    <div className={styles.portfolioValue}>
                        {formatCurrency(currentPortfolioValue)}
                    </div>
                </div>

                <div className={styles.metricsGrid}>
                    <div className={styles.metric}>
                        <div className={styles.metricLabel}>Supplied</div>
                        <div className={styles.metricValue}>
                            {formatCurrency(protocol.supplied)}
                        </div>
                        <div className={styles.metricDescription}>
                            Lending + farming positions
                        </div>
                    </div>

                    <div className={styles.metric}>
                        <div className={styles.metricLabel}>
                            <span className={styles.highlight}>Interest Earned</span>
                        </div>
                        <div className={styles.metricValue}>
                            {formatCurrency(protocol.interestEarned)}
                        </div>
                        <div className={styles.metricDescription}>
                            Available rewards
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.primaryButton}>
                        Manage Position
                    </button>
                    <button className={styles.secondaryButton} onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PortfolioModal;