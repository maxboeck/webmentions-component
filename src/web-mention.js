import { LitElement, html, css } from 'lit-element'

class WebMention extends LitElement {
    constructor() {
        super()

        this.url = ''
        this.author = 'Anonymous'
        this.avatar = ''
        this.published = ''
    }

    static get properties() {
        return {
            url: { type: String },
            author: { type: String },
            avatar: { type: String },
            published: { type: String }
        }
    }

    static get styles() {
        return css`
            :host {
                display: block;
            }
        `
    }

    render() {
        return html`
            <li>
                A WebMention
            </li>
        `
    }
}

customElements.define('web-mention', WebMention)
