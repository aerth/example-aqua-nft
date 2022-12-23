import { useEffect, useState } from 'react'

import toast, { Toaster, ToastOptions } from 'react-hot-toast'; // for notifications

import { Interface } from "ethers/lib/utils.js" // for building abi

import { configureChains, createClient, useAccount, useBalance, useContractRead, useContractReads, useContractWrite, useNetwork, usePrepareContractWrite, useSwitchNetwork, WagmiConfig } from 'wagmi'
import { Web3Button, Web3Modal } from '@web3modal/react'
import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum'

import { bsc, mainnet, polygon } from 'wagmi/chains'
import { aquabep20, aquachain } from "./aquachain"

import './style.css'
// 1. Get projectID at https://cloud.walletconnect.com
if (!process.env.REACT_APP_WALLETCONNECT) {
  throw new Error('You need to provide REACT_APP_WALLETCONNECT env variable')
}
const projectId = process.env.REACT_APP_WALLETCONNECT
// 2. Configure wagmi client
bsc.name = "BSC"
const chains = [aquachain, bsc, mainnet, polygon]
const { provider } = configureChains(chains, [walletConnectProvider({ projectId })])
const wagmiClient = createClient({ autoConnect: true, connectors: modalConnectors({ appName: 'web3Modal', chains }), provider })
// 3. Configure modal ethereum client
export const ethereumClient = new EthereumClient(wagmiClient, chains)

// 4. Wrap your app with WagmiProvider and add <Web3Modal /> compoennt
const modal = <Web3Modal
  projectId={projectId}
  ethereumClient={ethereumClient}
  enableNetworkView={true}
  themeMode={"dark"}
  // themeColor={"blackWhite"}
  chainImages={{ [aquachain.id]: "https://aquachain.github.io/img/a100.png" }}
  tokenImages={{
    [aquabep20]: "https://aquachain.github.io/img/aqua-icon.svg"
  }}
  themeBackground={"themeColor"}
/>

const ToasterOptions: ToastOptions = {
  // icon: <img src="https://aquachain.github.io/favicon.ico" />,
  duration: 5000,

}
export default function App() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  return (
    <>
      <div><a href={process.env.PUBLIC_URL}><img src="https://aquachain.github.io/img/a100.png" alt="logo" /></a><h1>mint free nft</h1><p>join the club</p></div>
      {ready ? (
        <WagmiConfig client={wagmiClient}>
          <div>
            <div style={{ maxWidth: "500px", margin: "auto" }}> <Web3Button label="Connect Wallet" balance="show" icon="show" /></div>
            <HomePage />
          </div>
        </WagmiConfig>
      ) : null
      }
      <Toaster
        position="bottom-center"
        reverseOrder={true}
        toastOptions={ToasterOptions}
      />
      {modal}
      <footer>
        <p>like this dapp? do it yourself: <code>git clone https://github.com/aerth/example-aqua-nft</code></p>
        <p><a href="https://aquachain.github.io/explorer/#/">aquachain explorer</a> | <a href="https://aquachain.github.io">more info</a></p>
      </footer>

    </>
  )
}

/// 5. prepare contract functions we will be using (or import json abi)
const contractAbi = new Interface([
  "function mint()",
  "function balanceOf(address) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)"
]).fragments

const nftAddress = "0x17c457444CeF6fD6e6F164624455f2C64Cf073ab" // free nft on aquachain

const readCfg = {
  abi: contractAbi,
  address: nftAddress,
  chainId: aquachain.id,
  onError: (e: any) => {
    console.log("error:", e);
    toast.error(`${e.message ?? e}`)
  },
}
/// 6. Page (or include hashrouter)
const HomePage = () => {
  const acct = useAccount()
  const { data: etherbalance } = useBalance({
    address: acct.address,
  })
  const { chain } = useNetwork()
  const { data: readDatas, error: balanceError } = useContractReads({
    contracts: [
      {
        enabled: !!chain && !!acct?.address && chain.id == aquachain.id,
        functionName: "balanceOf",
        watch: true,
        args: [acct.address],
        ...readCfg,
      },
      {
        enabled: !!chain && !!acct?.address && chain.id == aquachain.id,
        functionName: "totalSupply",
        watch: true,
        args: [],
        ...readCfg,
      },
    ]
  })
  const { switchNetwork } = useSwitchNetwork()
  const { config, error } = usePrepareContractWrite({
    address: nftAddress, // this should be the nft contract
    chainId: aquachain.id, // to be sure not sending tx on wrong network
    abi: contractAbi,
    functionName: "mint",
    args: [], // args if any
    enabled: acct && acct.address && chain && chain.id == aquachain.id,
    onError: (e) => {
      console.log("error:", e);
      toast.error(`${e.message ?? e}`)
    },

  })
  const { write: mint, data: writeData } = useContractWrite({
    ...config,
    onError: (e) => {
      toast.error(`mint error: ${e.message ?? e}`)
    }, onMutate: (ev) => {


    },
  })

  const balanceData = !readDatas ? undefined : readDatas[0]
  const supplyData = !readDatas ? undefined : readDatas[1]
  return (<div>
    {!!balanceError && (<p>balanceError: {`${balanceError.message ?? error}`}</p>)}
    {!!error && (<p>error: {`${error.message ?? error}`}</p>)}
    {!!acct.address && (<div><p>Connected Wallet: {acct?.address}</p>
      {!!supplyData && <p>Total NFT Supply: {`${supplyData}`}</p>}
      {!!balanceData && (<p>NFT Balance: {`${balanceData}`}</p>)}
      {!!writeData && !!writeData.hash && <p>view tx: <a href={aquachain.blockExplorers?.default.url + "tx/" + `${writeData.hash}`}>{writeData.hash}</a></p>}
      {!balanceData && (<p>You have no NFT</p>)}
      {(!etherbalance || etherbalance.value.isZero()) && (<p>You have no Ether: visit <a href="https://info.aquacha.in/faucet">faucet</a> or <a href="https://aquachain.github.io/explorer/#/pool">start mining</a></p>)}
      {!!chain && chain.id == aquachain.id && <button onClick={() => {
        if (!!mint) {
          mint()
        } else {
          toast.error("there was an issue, try refreshing or reconnect wallet.")
        }
      }}>Mint (free)</button>}
    </div>)}

    {!!acct.address && !!chain && chain.id != aquachain.id && <button onClick={() => {
      if (!!switchNetwork) {
        switchNetwork(aquachain.id)
      }
    }}>Wrong network. Click to switch.</button>}
  </div>)
}
