// SPDX-License-Identifier: MIT
// Deployed on Aquachain at address 0x17c457444CeF6fD6e6F164624455f2C64Cf073ab
// Byzantium, Optimize 200, 0.8.17+commit.8df45f5f
pragma solidity ^0.8.9;

import "@openzeppelin/contracts@4.8.0/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.8.0/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts@4.8.0/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts@4.8.0/access/Ownable.sol";
import "@openzeppelin/contracts@4.8.0/utils/Counters.sol";

contract BasicNFT is ERC721, ERC721Enumerable, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("NFT", "NFT") {}

    // free mint
    function mint() public {
        require(msg.sender == tx.origin, "be yourself");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        require(tokenId < 10000, "minted out");
        _safeMint(msg.sender, tokenId);
    }

    // eg: ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/
    function setBaseUri(string memory newUrl) public onlyOwner {
        _baseUrl = newUrl;
    }

    string private _baseUrl;

    function _baseURI() internal view override returns (string memory) {
        return _baseUrl;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
