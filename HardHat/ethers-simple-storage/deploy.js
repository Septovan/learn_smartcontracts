require("dotenv").config()
const ethers = require("ethers")
const fs = require("fs")

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL) // connect to a chain

  // const wallet = ethers.wallet(process.env.PRIVATE_KEY, provider)
  const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf-8")
  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    encryptedJson,
    process.env.PRIVATE_KEY_PASSWORD
  )
  wallet = await wallet.connect(provider)

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8")
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  )
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet)
  console.log("Deploying, please wait...")
  const contract = await contractFactory.deploy()
  await contract.deployTransaction.wait(1)
  console.log(`Contract address: ${contract.address}`)

  const currentFavoriteNumber = await contract.retrieve()
  console.log(`Current favorite number: ${currentFavoriteNumber.toString()}`)

  const transactionResponse = await contract.store("7")
  const transactionReceipt = await transactionResponse.wait(1)
  const updatedFavoriteNumber = await contract.retrieve()
  console.log(`Updated favorite number: ${updatedFavoriteNumber.toString()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
