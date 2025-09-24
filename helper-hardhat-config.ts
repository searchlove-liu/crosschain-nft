const TOKEN_NAME = "MyToken"
const TOKEN_SYMBLE = "MT"
export const WRAP_TOKEN_NAME = "WMyToken"
export const WARAP_TOKEN_SYMBLE = "WMT"
const networkConfig = new Map([
    [11155111, "sepolia"],
    [31337, "hardhat"]
])
const CONFIRMATIONS = 3
let myTokenAddr: string;
export { TOKEN_NAME, TOKEN_SYMBLE, networkConfig, CONFIRMATIONS, myTokenAddr }