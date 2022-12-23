import { Chain } from "wagmi";

export const aquachain: Chain = {
    id: 61717561,
    name: "Aquachain",
    nativeCurrency: {
        decimals: 18,
        name: "Aquachain",
        symbol: "AQUA"
    },
    network: "aquachain",

    rpcUrls: {
        default: {
            http: ["https://c.onical.org"],
        }
    },
    blockExplorers: {
        default: {
            name: "Aquachain Explorer",
            url: "https://aquachain.github.io/explorer/#/"
        },
    },

}
export const aquabep20 = "0x38FAB266089AAf3BC2F11B791213840Ea3D587C7"