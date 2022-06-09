import React from 'react';
import { getJsonWalletAddress } from 'ethers/lib/utils';
import { debounce } from 'lodash';
import { ERC20Token } from './types';
import { tokens } from './tokens';

import Button from './Button';

type Props = {};

function App({}: Props) {
    const [wallet, setWallet] = React.useState(null);
    const [count, setCount] = React.useState(10);

    const onWalletChange = (e) => {
        let walletAddress = e.target.value;
        if (walletAddress?.startsWith('0x')) {
            walletAddress = walletAddress.substring(2);
        }
        setWallet(walletAddress);
    };

    const onWalletSearch = (e) => {
        console.log('implement wallet search');
        // TODO: implement wallet search
    };

    return (
        <div className="w-full grid grid-cols-1 w-1/2">
            <div className="text-center p-8">
                <h1 className="text-4xl font-bold">Wallet Token Search</h1>
            </div>
            <div className="text-center p-4">
                Wallet address:
                <input
                    className="m-2 p-2 rounded bg-gray-50 hover:bg-white hover:border-blue-500 transition border-2"
                    type="text"
                    name="wallet"
                    placeholder="0x..."
                    onChange={debounce(onWalletChange, 500)}
                    onBlur={onWalletChange}
                />{' '}
                <button
                    className="text-white m-2 p-2 rounded bg-blue-500 hover:bg-blue-600 transition"
                    onClick={onWalletSearch}
                >
                    Search
                </button>
            </div>
            <div className="text-center pt-0 pb-2">
                How many top-N market cap erc20 tokens to search for:
                <select
                    className="ml-4 rounded transition border-2"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                >
                    <option value="10">50</option>
                    <option value="50">100</option>
                    <option value="100">200</option>
                </select>
            </div>
            <div className="h-56 m-4 border-2 border-gray-100">
                <div className="">Results</div>
                asda aasdfadsf count: {count}, wallet: {wallet}
            </div>
            <div className="m-4">
                ERC20Tokens:
                <ul>
                    {tokens.map((token) => (
                        <li key={token.address}>
                            <div className="text-xl font-bold">
                                {token.token}: ({token.name})
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
