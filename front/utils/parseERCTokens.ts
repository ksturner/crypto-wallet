import { JSDOM } from 'jsdom';
import { ERC20Token } from '../types';

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
