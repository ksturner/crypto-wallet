import fs from 'fs';
import { JSDOM } from 'jsdom';
import { ERC20Token } from './front/types';

const tokens: ERC20Token[] = [];
const setErc20Tokens = (newTokens) => {
    tokens.push(...newTokens);
};

export function parseERC20Tokens(html: string): ERC20Token[] {
    const ercTokens = [];
    const document = new JSDOM(html).window.document;
    const el = document.createElement('html');
    el.innerHTML = html;

    const links = el.getElementsByTagName('a');
    for (const l of links) {
        const href = l.href;
        if (href.startsWith('/token/0x')) {
            const m = l.text.match(/^(.+)\s+\((.+)\)/);
            const address = href.split('/')[2];
            if (m) {
                const name = m[1];
                const token = m[2];
                ercTokens.push({ name, token, address });
            }
        }
    }
    return ercTokens;
}

// Read file contents into string variable and return it
function readFile(filePath: string): string {
    const contents = fs.readFileSync(filePath, 'utf8');
    return contents;
}
function loadTokens(filePath: string): ERC20Token[] {
    const contents = readFile(filePath);
    const tokens = parseERC20Tokens(contents);
    return tokens;
}

setErc20Tokens(loadTokens('./page1.html'));
setErc20Tokens(loadTokens('./page2.html'));
setErc20Tokens(loadTokens('./page3.html'));
setErc20Tokens(loadTokens('./page4.html'));

console.log(`found ${tokens.length} tokens`);
// fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 2));

const tsFile = `
import { ERC20Token } from './types';
export const tokens: ERC20Tokens[] = [
${tokens
    .map(
        (t) =>
            `    { name: '${t.name}', token: '${t.token}', address: '${t.address}' },`
    )
    .join('\n')}
];
`;
fs.writeFileSync('./front/tokens.ts', tsFile);
