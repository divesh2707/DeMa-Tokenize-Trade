const ERC721ABI = [
    {
      constant: true,
      inputs: [{ name: "tokenId", type: "uint256" }],
      name: "ownerOf",
      outputs: [{ name: "", type: "address" }],
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "to", type: "address" },
        { name: "tokenId", type: "uint256" },
      ],
      name: "approve",
      outputs: [],
      type: "function",
    },
    {
      constant: true,
      inputs: [{ name: "tokenId", type: "uint256" }],
      name: "getApproved",
      outputs: [{ name: "", type: "address" }],
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "operator", type: "address" },
        { name: "approved", type: "bool" },
      ],
      name: "setApprovalForAll",
      outputs: [],
      type: "function",
    },
    {
      constant: true,
      inputs: [
        { name: "owner", type: "address" },
        { name: "operator", type: "address" },
      ],
      name: "isApprovedForAll",
      outputs: [{ name: "", type: "bool" }],
      type: "function",
    },
  ];
  
  export default ERC721ABI;
  