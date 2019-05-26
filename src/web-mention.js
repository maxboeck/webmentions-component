import { LitElement, html, css } from 'lit-element'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'

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
            img {
                border-radius: 50%;
                object-fit: cover;
                margin-right: 0.5em;
                background-color: #ededed;
            }
            header,
            header > a {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
            }
            header > a {
                margin-right: 1em;
            }
        `
    }

    render() {
        return html`
            <div>
                <header>
                    <a href=${this.url}>
                        <img src=${this.avatar} width="40" height="40" alt="" />
                        <span>${this.author}</span>
                    </a>
                    <time datetime=${this.published}>
                        ${format(
                            parseISO(this.published),
                            'dd.MM.yyyy - HH:mm'
                        )}
                    </time>
                </header>
                <slot></slot>
            </div>
        `
    }
}

customElements.define('web-mention', WebMention)
