// SPDX-License-Identifier: -BCOM-

pragma solidity ^0.8.0;

/**
 * @title CustomBIP39WordResolver
 * @dev Contract to store a custom 2048-word list and map its words to
 * the corresponding indices of the standard BIP-39 word list.
 * This allows a custom human-readable seed phrase to be resolved
 * back to the standard numerical indices for off-chain key derivation.
 *
 * WARNINGS:
 * 1. Deploying and populating this contract with 2048 words will incur
 * very high gas costs and likely require batching the `addWordsBatch` calls.
 * 2. This contract DOES NOT perform any cryptographic key derivation.
 * Actual BIP-39 key derivation MUST still be done securely OFF-CHAIN
 * using the resolved standard indices or words.
 * 3. Be mindful of duplicate custom words if you don't want them to map to
 * the same index. The `addWordsBatch` currently has a basic check for this.
 */
contract CustomBIP39WordResolver {
    // Array to store the custom 2048 words.
    // The index of a word in this array (0-2047) corresponds directly
    // to the index of the original BIP-39 word it represents.
    string[] public customWords;

    // Mapping for efficient lookup: custom_word_string -> original_BIP39_index (uint16)
    // Note: If a word is not found, mapping returns the default value (0 for uint16).
    // If your custom word for index 0 is truly "0", this can be ambiguous for "not found".
    mapping(string => uint16) private customWordToIndex;

    // Event to log when words are added, useful for off-chain indexing
    event WordsAdded(uint256 startIndex, uint256 count);

    // Mapping to track user balances (in wei)
    mapping(address => uint256) public balances;

    // Event for payment
    event PaymentReceived(address indexed from, uint256 amount);

    // Only allow the deployer (owner) to add words
    address public owner;

    // Constants for standard BIP-39 phrase lengths
    uint256 private constant BIP39_LENGTH_12 = 12;
    uint256 private constant BIP39_LENGTH_24 = 24;
    uint256 private constant MAX_BIP39_WORDS = 2048;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @dev Adds a batch of custom words to the list.
     * The order of words in _words array matters, as their position
     * determines their corresponding BIP-39 index.
     * Call this function multiple times to add all 2048 words if needed.
     * Ensure the total count does not exceed 2048.
     * @param _words An array of custom words to add.
     */
    function addWordsBatch(
        string[] calldata _words
    )
    public onlyOwner {

        uint256 currentLength = customWords.length;
        require(currentLength + _words.length <= MAX_BIP39_WORDS, "Exceeds max words limit (2048)");

        for (uint256 i = 0; i < _words.length; i++) {
            string memory newWord = _words[i];
            uint16 index = uint16(currentLength + i);

            // Basic check to prevent overriding or inconsistent duplicates.
            // If customWordToIndex[newWord] is non-zero and not the current index, it's a conflict.
            if (customWordToIndex[newWord] != 0 && customWordToIndex[newWord] != index) {
                revert("Duplicate word detected with different index mapping");
            }
            if (bytes(newWord).length == 0) {
                revert("Cannot add empty word");
            }

            customWords.push(newWord);
            customWordToIndex[newWord] = index;
        }
        emit WordsAdded(currentLength, _words.length);
    }

    /**
     * @dev Retrieves a custom word based on its standard BIP-39 index.
     * @param _originalBIP39Index The standard BIP-39 index (0-2047).
     * @return The custom word mapped to that index.
     */
    function getCustomWord(uint16 _originalBIP39Index) public view returns (string memory) {
        require(_originalBIP39Index < customWords.length, "Index out of bounds or not yet populated");
        return customWords[_originalBIP39Index];
    }

    /**
     * @dev Resolves a custom word back to its standard BIP-39 index.
     * @param _customWord The custom word to lookup.
     * @return The standard BIP-39 index (0-2047) corresponding to the custom word.
     * Returns 0 if the word is not found. Be aware of ambiguity if your
     * custom word for index 0 genuinely maps to 0 and other lookups
     * also return 0 for not found.
     */
    function getOriginalBIP39Index(string calldata _customWord) public view returns (uint16) {
        return customWordToIndex[_customWord];
    }

    /**
     * @dev Resolves an entire array of custom words (12 or 24) to their
     * corresponding standard BIP-39 indices.
     * @param _customWords An array of 12 or 24 custom words.
     * @return An array of uint16 representing the standard BIP-39 indices.
     * If a word is not found, its corresponding index will be 0.
     */
    function getOriginalBIP39Indices(
        string[] memory _customWords
    )
        public
        view
        returns (uint16[] memory)
    {
        uint256 len = _customWords.length;
        require(len == BIP39_LENGTH_12 || len == BIP39_LENGTH_24, "Input must be 12 or 24 words");

        uint16[] memory resolvedIndices = new uint16[](len);
        for (uint256 i = 0; i < len; i++) {
            resolvedIndices[i] = customWordToIndex[_customWords[i]];
        }

        return resolvedIndices;
    }

    /**
     * @dev Maps an array of standard BIP-39 indices (12 or 24) to their
     * corresponding custom words.
     * @param _originalBIP39Indices An array of 12 or 24 uint16 indices.
     * @return An array of strings representing the custom words.
     * If an index is out of bounds or not yet populated,
     * its corresponding word will be an empty string.
     */
    function getCustomWords(uint16[] memory _originalBIP39Indices)
        public
        view
        returns (string[] memory)
    {
        uint256 len = _originalBIP39Indices.length;
        require(len == BIP39_LENGTH_12 || len == BIP39_LENGTH_24, "Input must be 12 or 24 indices");

        string[] memory resolvedWords = new string[](len);
        for (uint256 i = 0; i < len; i++) {
            uint16 index = _originalBIP39Indices[i];
            if (index < customWords.length) {
                resolvedWords[i] = customWords[index];
            } else {
                // If index is out of bounds, return an empty string for that position
                resolvedWords[i] = "";
            }
        }
        return resolvedWords;
    }

    /**
     * @dev Returns the total number of custom words currently stored.
     * @return The current count of words. Should be 2048 for a full list.
     */
    function getTotalCustomWords()
        public
        view
        returns (uint256)
    {
        return customWords.length;
    }

    // Payable function to receive payments and update balances
    function pay() external payable {
        require(msg.value > 0, "Must send some value");
        balances[msg.sender] += msg.value;
        emit PaymentReceived(msg.sender, msg.value);
    }

    // Allow contract to receive plain transfers
    receive() external payable {
        balances[msg.sender] += msg.value;
        emit PaymentReceived(msg.sender, msg.value);
    }

    // Optional: owner can withdraw funds
    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        require(address(this).balance >= amount, "Insufficient contract balance");
        payable(owner).transfer(amount);
    }
}