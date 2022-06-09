import React from 'react';
import { ethers /*, Contract, Wallet */ } from 'ethers';
import { getJsonWalletAddress } from 'ethers/lib/utils';
import { debounce } from 'lodash';
import { ERC20Token } from './types';
import { tokens } from './tokens';

type Props = {};

async function getBalance(balances, tokenArg, contractArg, addressArg) {
    try {
        const balance = await contractArg.balanceOf(addressArg);
        const t = Object.assign({}, tokenArg, {
            balance: ethers.utils.formatEther(balance),
        });
        balances.push(t);
    } catch (e) {
        // do nothing; this is fine
    }
}
async function getWalletValue(balances) {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
    const coins = await response.json();
    console.log(coins);
    const ourTokens = balances.map((t) => t.token.toUpperCase());
    const ourCoins = coins.filter(
        (c) =>
            ourTokens.includes(c.symbol.toUpperCase()) &&
            c.id !== 'ethereum-wormhole'
    );
    for (const c of ourCoins) {
        const urlCrypto = 'https://api.coingecko.com/api/v3/coins/' + c.id;
        const responseCrypto = await fetch(urlCrypto);
        const coinData = await responseCrypto.json();
        const dollarPrice = coinData.market_data.current_price.usd;
        const c2 = balances.find(
            (t) => t.token.toUpperCase() === c.symbol.toUpperCase()
        );
        c2.dollarPrice = dollarPrice;
        c2.geckoId = c.id;
    }
}
const zeroPad = (num, places) => String(num).padStart(places, '0');

const contractAbiFragment = [
    {
        name: 'balanceOf',
        type: 'function',
        inputs: [
            {
                name: '_owner',
                type: 'address',
            },
        ],
        outputs: [
            {
                name: 'balance',
                type: 'uint256',
            },
        ],
        constant: true,
        payable: false,
    },
];

function App({}: Props) {
    const [wallet, setWallet] = React.useState(null);
    const [count, setCount] = React.useState(50);
    const [walletBalances, setWalletBalances] = React.useState([]);

    const onWalletChange = (e) => {
        let walletAddress = e.target.value;
        if (walletAddress?.startsWith('0x')) {
            walletAddress = walletAddress.substring(2);
        }
        setWallet(walletAddress);
    };

    const onWalletSearch = async (e) => {
        const INFURA_ID = '4a041132e6dc4b998d5f793cd3c3063b';
        const provider = new ethers.providers.JsonRpcProvider(
            `https://mainnet.infura.io/v3/${INFURA_ID}`
        );

        const address = wallet;
        let balances = [];
        const promiseQueue = [];

        for (const token of tokens.slice(0, count)) {
            if (token.address) {
                const contract = new ethers.Contract(
                    token.address,
                    contractAbiFragment,
                    provider
                );
                try {
                    promiseQueue.push(
                        getBalance(balances, token, contract, address)
                    );
                } catch (e) {
                    console.log(e);
                }
            }
        }
        await Promise.all(promiseQueue);
        const balance = await provider.getBalance(address);
        const t = {
            name: 'Ethereum',
            token: 'ETH',
            balance: ethers.utils.formatEther(balance),
        };
        balances.push(t);
        balances = balances.filter((b) => b.balance > 0.00000000000000001);
        await getWalletValue(balances);
        setWalletBalances(balances);
    };

    return (
        <div className="w-full grid grid-cols-1 place-items-center">
            <div className="text-center p-8">
                <h1 className="text-4xl font-bold">Wallet Token Search</h1>
            </div>
            <div className="text-center pb-0 mb-0 p-2 pt-4 sm:w-full md:w-3/4 lg:w-1/2">
                <span className="pb-4 block text-left text-gray-500">
                    This app searches an ERC20 compatible wallet (Ethereum
                    wallet) for any balances it can find for the top N ERC20
                    tokens out there by market cap. This is useful for
                    situations like in MetaMask where you have to manually add
                    tokens before you can see if you have any balance, which can
                    be a pain if you've forgotten if you own the tokens.
                </span>
                <span className="text-gray-400 block">
                    Example: 0x94de7E2c73529EbF3206Aa3459e699fbCdfCD49b
                </span>
            </div>
            <div className="text-center p-4">
                Wallet address:
                <input
                    className="m-2 p-2 rounded bg-gray-50 hover:bg-white hover:border-blue-500 transition border-2"
                    type="text"
                    name="wallet"
                    placeholder="0x..."
                    size={44}
                    onChange={debounce(onWalletChange, 400)}
                    onBlur={onWalletChange}
                />{' '}
                <button
                    className={
                        'text-white m-2 p-2 rounded bg-blue-500 hover:bg-blue-600 transition' +
                        (wallet ? '' : ' opacity-50 cursor-not-allowed')
                    }
                    onClick={onWalletSearch}
                    disabled={!wallet}
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
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                </select>
            </div>
            {/* <p>0x94de7E2c73529EbF3206Aa3459e699fbCdfCD49b</p> */}
            {walletBalances.length > 0 && (
                <>
                    <div className="text-center mt-8">
                        <h2 className="text-2xl font-bold">Wallet Balances</h2>
                    </div>
                    <div className="text-center grid grid-cols-5">
                        <div className="text-center font-bold p-4">Token</div>
                        <div className="text-center font-bold p-4 col-span-2">
                            Balance
                        </div>
                        <div className="text-center font-bold p-4 col-span-2">
                            Dollar Value
                        </div>
                        {walletBalances.map((b) => {
                            const decimalPart = Math.trunc(
                                (b.balance - Math.trunc(b.balance)) * 1000
                            );
                            const integerPart = Math.trunc(b.balance);
                            const dollarValue =
                                Math.round(
                                    Number(b.dollarPrice) *
                                        Number(b.balance) *
                                        100
                                ) / 100;
                            const integerDollar = dollarValue
                                ? Math.trunc(dollarValue)
                                : null;
                            const decimalDollar = dollarValue
                                ? Math.trunc(
                                      (dollarValue - Math.trunc(dollarValue)) *
                                          100
                                  )
                                : null;
                            return (
                                <>
                                    <div>
                                        <a
                                            className="text-sky-700 underline"
                                            href={`https://www.coingecko.com/en/coins/${b.geckoId}`}
                                        >
                                            {b.name} ({b.token}){' '}
                                        </a>
                                    </div>
                                    <div className="text-right mr-0 pr-0">
                                        {integerPart}.
                                    </div>
                                    <div className="text-left pl-0 ml-0">
                                        {zeroPad(decimalPart, 3)}
                                    </div>
                                    <div className="text-right mr-0 pr-0">
                                        {integerDollar && (
                                            <>
                                                ${' '}
                                                {integerDollar.toLocaleString(
                                                    'en-US'
                                                )}
                                                .
                                            </>
                                        )}
                                    </div>
                                    <div className="text-left pl-0 ml-0">
                                        {decimalDollar &&
                                            zeroPad(decimalDollar, 2)}
                                        {!decimalDollar && '?'}
                                    </div>
                                </>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
