const TOKEN_NAME = "mydog"
const TOKEN_SYMBLE = "mydog"
const networkConfig = new Map([
    [11155111, "sepolia"],
    [31337, "hardhat"]
])
const CONFIRMATIONS = 3
let myTokenAddr: string;
export { TOKEN_NAME, TOKEN_SYMBLE, networkConfig, CONFIRMATIONS, myTokenAddr }