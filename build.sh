#!/usr/bin/env bash
curl -G -o page1.html https://etherscan.io/tokens?p=1
curl -G -o page2.html https://etherscan.io/tokens?p=2
curl -G -o page3.html https://etherscan.io/tokens?p=3
curl -G -o page4.html https://etherscan.io/tokens?p=4
ts-node fetchERCTokens.ts
npx parcel build front/index.html --dist-dir build/public
rm page*.html