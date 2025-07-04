import { useEffect } from "react";
import cn from "classnames";
import styles from "./SettingsModal.module.sass";

type SettingsModalProps = {
    visible: boolean;
    onClose: () => void;
    settings: {
        passwordProtected: boolean;
        duressMode: boolean;
        requireWorldID: boolean;
        timestampVerification: boolean;
        multiLayerEncryption: boolean;
        decoyData: boolean;
        autoDestruct: boolean;
    };
    onSettingToggle: (settingKey: keyof SettingsModalProps['settings']) => void;
};

const SettingsModal = ({ visible, onClose, settings, onSettingToggle }: SettingsModalProps) => {
    // Handle ESC key press
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && visible) {
                onClose();
            }
        };

        if (visible) {
            document.addEventListener('keydown', handleEscapeKey);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = '';
        };
    }, [visible, onClose]);

    if (!visible) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.settingsModalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Encryption Settings</h3>
                    <button
                        className={styles.modalClose}
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className={styles.settingsBody}>
                    <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                            <h4 className={styles.settingTitle}>🔐 Password Protected</h4>
                            <p className={styles.settingDescription}>Require password to retrieve the hidden message</p>
                        </div>
                        <label className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={settings.passwordProtected}
                                onChange={() => onSettingToggle('passwordProtected')}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>

                    <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                            <h4 className={styles.settingTitle}>🚨 Duress Panic Mode</h4>
                            <p className={styles.settingDescription}>Show decoy data when accessed under duress</p>
                        </div>
                        <label className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={settings.duressMode}
                                onChange={() => onSettingToggle('duressMode')}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>

                    <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                            <h4 className={styles.settingTitle}>🌍 Require World ID</h4>
                            <p className={styles.settingDescription}>Verify identity with World ID before decoding</p>
                        </div>
                        <label className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={settings.requireWorldID}
                                onChange={() => onSettingToggle('requireWorldID')}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                    <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                            <h4 className={styles.settingTitle}>💰 Require Payment</h4>
                            <p className={styles.settingDescription}>
                                Require payment to decode the hidden message
                            </p>
                        </div>
                        <label className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={settings.decoyData}
                                onChange={() => onSettingToggle('decoyData')}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                    <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                            <h4 className={styles.settingTitle}>🔒 Multi-Layer Encryption</h4>
                            <p className={styles.settingDescription}>
                                Issues a decryption key to the user
                            </p>
                        </div>
                        <label className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={settings.multiLayerEncryption}
                                onChange={() => onSettingToggle('multiLayerEncryption')}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                    <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                            <h4 className={styles.settingTitle}>💣 Auto Destruct Message</h4>
                            <p className={styles.settingDescription}>Destroys data after revealing the hidden message</p>
                        </div>
                        <label className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={settings.autoDestruct}
                                onChange={() => onSettingToggle('autoDestruct')}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                </div>

                <div className={styles.settingsFooter}>
                    <button
                        className={cn("button", styles.saveSettingsButton, styles.disabled)}
                        onClick={onClose}
                        disabled={true}
                    >
                        Pro Version Required
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal; 