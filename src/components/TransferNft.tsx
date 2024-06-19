import { BuildTransferNftBody } from '@/contracts/nftItem/NftItem'
import { useTonAddress } from '@tonconnect/ui-react'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, Cell } from 'ton-core'
import { ResultContainer } from './ResultContainer'

export function TransferNft() {
  const senderAddress = useTonAddress()
  const [nftAddress, setNftAddress] = useState('')
  const [queryId, setQueryId] = useState('0')
  const [newOwnerAddress, setNewOwnerAddress] = useState('')
  const [responseDestinationAddress, setResponseDestinationAddress] = useState('')
  const [forwardAmount, setForwardAmount] = useState('1')
  const [forwardPayload, setForwardPayload] = useState('')

  useEffect(() => {
    try {
      Address.parse(responseDestinationAddress)
      return
    } catch (e) {}

    let sender: Address
    try {
      sender = Address.parse(senderAddress)
    } catch (e) {
      return
    }

    setResponseDestinationAddress(sender.toString({ bounceable: false, urlSafe: true }))
  }, [senderAddress, responseDestinationAddress])

  useEffect(() => {
    let newOwner: ReturnType<typeof Address.parseFriendly>
    try {
      newOwner = Address.parseFriendly(newOwnerAddress)
    } catch (e) {
      return
    }

    if (!newOwner.isBounceable) {
      return
    }

    setNewOwnerAddress(newOwner.address.toString({ bounceable: false, urlSafe: true }))
  }, [newOwnerAddress])

  useEffect(() => {
    let destination: ReturnType<typeof Address.parseFriendly>
    try {
      destination = Address.parseFriendly(responseDestinationAddress)
    } catch (e) {
      return
    }

    if (!destination.isBounceable) {
      return
    }

    setResponseDestinationAddress(
      destination.address.toString({ bounceable: false, urlSafe: true })
    )
  }, [responseDestinationAddress])

  const deployParams = useMemo(() => {
    if (!nftAddress || !newOwnerAddress || !senderAddress) {
      return
    }

    let message: Cell | null = null
    try {
      message = BuildTransferNftBody({
        queryId: queryId ? parseInt(queryId, 10) : 0,
        newOwner: Address.parse(newOwnerAddress),
        responseTo: responseDestinationAddress
          ? Address.parse(responseDestinationAddress)
          : Address.parse(senderAddress),
        forwardAmount: BigInt(forwardAmount),
        forwardPayload: forwardPayload ? Cell.fromBase64(forwardPayload) : undefined,
      })
    } catch (e) {}

    return message
  }, [queryId, senderAddress, nftAddress, newOwnerAddress, forwardAmount, forwardPayload])

  return (
    <div className="container mx-auto">
      <div>
        <label htmlFor="jettonContractAddress">nftAddress:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="jettonContractAddress"
          value={nftAddress}
          onChange={(e) => setNftAddress(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">queryId:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="queryId"
          value={queryId}
          onChange={(e) => setQueryId(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">newOwnerAddress:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="destinationAddress"
          value={newOwnerAddress}
          onChange={(e) => setNewOwnerAddress(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">responseDestinationAddress:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="responseDestinationAddress"
          value={responseDestinationAddress}
          onChange={(e) => setResponseDestinationAddress(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">forwardAmount (in nano, 1 for just notification):</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="forwardAmount"
          value={forwardAmount}
          onChange={(e) => setForwardAmount(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">forwardPayload (base64):</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="forwardPayload"
          value={forwardPayload}
          onChange={(e) => setForwardPayload(e.target.value)}
        />
      </div>

      {deployParams && (
        <>
          <ResultContainer
            address={nftAddress}
            cell={deployParams}
            amount={new BN(100000000)}
          />
        </>
      )}
    </div>
  )
}
