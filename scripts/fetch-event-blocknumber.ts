import dotenv from 'dotenv';
dotenv.config();

import { Contract } from '@ethersproject/contracts';
import { StaticJsonRpcProvider, Provider } from '@ethersproject/providers';
import { Network } from '../src/constants';
import { Address } from '../src/types';
import { generateConfig } from '../src/config';
// TODO: Import correct ABI
import ABI from '../src/abi/angle-transmuter/MorphoVault.json';

// This is a helper script to fetch blockNumbers where a certain
// event was released by a certain contract
export async function getBlockNumbersForEvents(
  contractAddress: Address,
  contractABI: any,
  eventNames: string[],
  blocksBack: number,
  blocksToCheck: number,
  provider: Provider,
) {
  const blockNumber = (await provider.getBlockNumber()) - blocksBack;
  const contract = new Contract(contractAddress, contractABI, provider);
  for (let eventName of eventNames) {
    console.log(
      eventName,
      'topic',
      contract.interface.getEventTopic(eventName),
    );
    const logs = await contract.queryFilter(
      contract.filters[eventName](),
      blockNumber - blocksToCheck,
      blockNumber,
    );
    console.log(
      eventName,
      logs.map((val: any) => val.blockNumber),
    );
  }
}

// TODO: Set your values here
const network = Network.MAINNET;
const eventNames = ['UpdateLastTotalAssets', 'Deposit', 'Withdraw'];
const address = '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB';
const provider = new StaticJsonRpcProvider(
  generateConfig(network).privateHttpProvider,
  network,
);

getBlockNumbersForEvents(address, ABI, eventNames, 0, 150000, provider);
